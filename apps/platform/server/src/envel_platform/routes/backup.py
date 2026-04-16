import os
import secrets
import sqlite3
import urllib.parse
from datetime import datetime

from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse, JSONResponse

from envel_platform.auth import require_user
from envel_platform.backup import backup_user, get_user_google_info

router = APIRouter()

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
PLATFORM_BASE_URL = os.environ.get("PLATFORM_BASE_URL", "https://maulairfani.my.id")
GOOGLE_REDIRECT_URI = f"{PLATFORM_BASE_URL}/api/backup/google/callback"
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_SCOPES = "https://www.googleapis.com/auth/drive.file"

# Short-lived state store for the Drive-only OAuth flow
_pending_states: dict[str, str] = {}  # state → username


def _get_users_conn() -> sqlite3.Connection:
    users_db = os.environ.get("USERS_DB")
    if not users_db:
        raise RuntimeError("USERS_DB not set")
    conn = sqlite3.connect(users_db)
    conn.row_factory = sqlite3.Row
    return conn


@router.get("/status")
async def backup_status(username: str = Depends(require_user)):
    info = get_user_google_info(username)
    if not info:
        return {"connected": False}

    with _get_users_conn() as conn:
        row = conn.execute(
            "SELECT last_backup_at FROM users WHERE username = ?", (username,)
        ).fetchone()
    last_backup = None
    if row:
        try:
            last_backup = row["last_backup_at"]
        except Exception:
            pass

    return {
        "connected": True,
        "google_email": info.get("google_email"),
        "last_backup_at": last_backup,
    }


@router.post("/trigger")
async def trigger_backup(username: str = Depends(require_user)):
    result = await backup_user(username)
    if not result["ok"]:
        return JSONResponse({"error": result["error"]}, status_code=400)
    return {"ok": True, "file_id": result.get("file_id")}


@router.get("/google/connect")
async def google_connect(username: str = Depends(require_user)):
    """Start Google Drive OAuth for users who logged in with username/password."""
    if not GOOGLE_CLIENT_ID:
        return JSONResponse({"error": "Google OAuth not configured"}, status_code=501)

    state = secrets.token_hex(16)
    _pending_states[state] = username

    params = urllib.parse.urlencode({
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": GOOGLE_SCOPES,
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    })
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{params}", status_code=302)


@router.get("/google/callback")
async def google_callback(code: str = "", state: str = ""):
    """Handle Google redirect after Drive authorization."""
    import httpx

    username = _pending_states.pop(state, None)
    if not username:
        return JSONResponse({"error": "Invalid or expired state"}, status_code=400)

    async with httpx.AsyncClient() as client:
        resp = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })

    if resp.status_code != 200:
        return JSONResponse({"error": "Google token exchange failed"}, status_code=502)

    token_data = resp.json()
    refresh_token = token_data.get("refresh_token")
    if not refresh_token:
        return JSONResponse(
            {"error": "No refresh token returned — please revoke access at myaccount.google.com and try again"},
            status_code=400,
        )

    with _get_users_conn() as conn:
        conn.execute(
            "UPDATE users SET google_refresh_token = ? WHERE username = ?",
            (refresh_token, username),
        )
        conn.commit()

    # Redirect back to platform settings
    return RedirectResponse(url=f"{PLATFORM_BASE_URL}/settings?drive=connected", status_code=302)


@router.delete("/google/disconnect")
async def google_disconnect(username: str = Depends(require_user)):
    with _get_users_conn() as conn:
        conn.execute(
            "UPDATE users SET google_refresh_token = NULL WHERE username = ?",
            (username,),
        )
        conn.commit()
    return {"ok": True}
