import os
import sqlite3


def _get_conn():
    return sqlite3.connect(os.environ["PLATFORM_DB_PATH"])


def init_platform_db() -> None:
    conn = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            username   TEXT NOT NULL UNIQUE,
            workos_id  TEXT NOT NULL UNIQUE,
            db_path    TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()


def get_user_by_workos_id(workos_id: str) -> dict | None:
    conn = _get_conn()
    cur = conn.execute("SELECT * FROM users WHERE workos_id = ?", (workos_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    cols = [d[0] for d in cur.description]
    return dict(zip(cols, row))
