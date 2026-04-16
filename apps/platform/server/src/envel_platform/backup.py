"""Google Drive backup logic for per-user SQLite databases."""

import logging
import os
import sqlite3
import time
from pathlib import Path

import httpx

logger = logging.getLogger("envel_platform")

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files"
DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"
BACKUP_FOLDER_NAME = "Envel Backup"
KEEP_BACKUPS = 7


# ── Token management ─────────────────────────────────────────────────────────

def _get_users_conn() -> sqlite3.Connection:
    users_db = os.environ.get("USERS_DB")
    if not users_db:
        raise RuntimeError("USERS_DB env var not set")
    conn = sqlite3.connect(users_db)
    conn.row_factory = sqlite3.Row
    return conn


def get_user_google_info(username: str) -> dict | None:
    """Return google_refresh_token and db_path for user, or None if not connected."""
    with _get_users_conn() as conn:
        row = conn.execute(
            "SELECT db_path, google_email, google_refresh_token FROM users WHERE username = ?",
            (username,),
        ).fetchone()
    if not row or not row["google_refresh_token"]:
        return None
    return dict(row)


def get_all_users_with_google() -> list[dict]:
    """Return all users that have a Google refresh token linked."""
    with _get_users_conn() as conn:
        rows = conn.execute(
            "SELECT username, db_path, google_email, google_refresh_token FROM users "
            "WHERE google_refresh_token IS NOT NULL"
        ).fetchall()
    return [dict(r) for r in rows]


async def refresh_google_token(refresh_token: str) -> str:
    """Exchange refresh token for a fresh access token."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(GOOGLE_TOKEN_URL, data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
        })
    if resp.status_code != 200:
        raise RuntimeError(f"Token refresh failed: {resp.text}")
    return resp.json()["access_token"]


# ── Drive helpers ────────────────────────────────────────────────────────────

async def get_or_create_backup_folder(access_token: str) -> str:
    """Return the Drive folder ID for BACKUP_FOLDER_NAME, creating it if needed."""
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            DRIVE_FILES_URL,
            headers=headers,
            params={
                "q": f"name='{BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false",
                "fields": "files(id)",
            },
        )
    resp.raise_for_status()
    files = resp.json().get("files", [])
    if files:
        return files[0]["id"]

    # Create folder
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            DRIVE_FILES_URL,
            headers={**headers, "Content-Type": "application/json"},
            json={"name": BACKUP_FOLDER_NAME, "mimeType": "application/vnd.google-apps.folder"},
        )
    resp.raise_for_status()
    return resp.json()["id"]


async def upload_db_file(access_token: str, folder_id: str, db_path: str, username: str) -> str:
    """Upload db_path to Drive folder, return the new file's ID."""
    from datetime import datetime
    timestamp = datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"envel_{username}_{timestamp}.db"

    db_bytes = Path(db_path).read_bytes()
    headers = {"Authorization": f"Bearer {access_token}"}

    # Multipart upload
    boundary = "envel_backup_boundary"
    metadata = f'{{"name": "{filename}", "parents": ["{folder_id}"]}}'
    body = (
        f"--{boundary}\r\n"
        f"Content-Type: application/json\r\n\r\n"
        f"{metadata}\r\n"
        f"--{boundary}\r\n"
        f"Content-Type: application/octet-stream\r\n\r\n"
    ).encode() + db_bytes + f"\r\n--{boundary}--".encode()

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{DRIVE_UPLOAD_URL}?uploadType=multipart",
            headers={**headers, "Content-Type": f"multipart/related; boundary={boundary}"},
            content=body,
        )
    resp.raise_for_status()
    return resp.json()["id"]


async def cleanup_old_backups(access_token: str, folder_id: str) -> None:
    """Keep only the KEEP_BACKUPS most recent files in the backup folder."""
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            DRIVE_FILES_URL,
            headers=headers,
            params={
                "q": f"'{folder_id}' in parents and trashed=false",
                "fields": "files(id, name, createdTime)",
                "orderBy": "createdTime desc",
            },
        )
    resp.raise_for_status()
    files = resp.json().get("files", [])

    to_delete = files[KEEP_BACKUPS:]
    async with httpx.AsyncClient() as client:
        for f in to_delete:
            await client.delete(
                f"{DRIVE_FILES_URL}/{f['id']}",
                headers=headers,
            )
            logger.info("backup_deleted_old", extra={"file": f["name"]})


# ── Main backup entry points ─────────────────────────────────────────────────

async def backup_user(username: str) -> dict:
    """Run full backup for a single user. Returns status dict."""
    info = get_user_google_info(username)
    if not info:
        return {"ok": False, "error": "Google Drive not connected"}

    db_path = info["db_path"]
    if not Path(db_path).exists():
        return {"ok": False, "error": f"Database file not found: {db_path}"}

    try:
        access_token = await refresh_google_token(info["google_refresh_token"])
        folder_id = await get_or_create_backup_folder(access_token)
        file_id = await upload_db_file(access_token, folder_id, db_path, username)
        await cleanup_old_backups(access_token, folder_id)

        # Record last backup time
        with _get_users_conn() as conn:
            try:
                conn.execute("ALTER TABLE users ADD COLUMN last_backup_at TEXT")
                conn.commit()
            except sqlite3.OperationalError:
                pass
            conn.execute(
                "UPDATE users SET last_backup_at = datetime('now') WHERE username = ?",
                (username,),
            )
            conn.commit()

        logger.info("backup_ok", extra={"username": username, "drive_file_id": file_id})
        return {"ok": True, "file_id": file_id}

    except Exception as exc:
        logger.error("backup_failed", extra={"username": username, "error": str(exc)})
        return {"ok": False, "error": str(exc)}


async def backup_all_users() -> None:
    """Scheduled job: backup every user that has Google Drive connected."""
    users = get_all_users_with_google()
    logger.info("scheduled_backup_start", extra={"user_count": len(users)})
    for user in users:
        await backup_user(user["username"])
