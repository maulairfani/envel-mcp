import os

import libsql


def _get_conn():
    return libsql.connect(
        os.environ["PLATFORM_TURSO_URL"],
        auth_token=os.environ["PLATFORM_TURSO_TOKEN"],
    )


def init_platform_db() -> None:
    conn = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT NOT NULL UNIQUE,
            api_key     TEXT NOT NULL UNIQUE,
            turso_url   TEXT NOT NULL,
            turso_token TEXT NOT NULL,
            created_at  TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()


def get_user_by_api_key(api_key: str) -> dict | None:
    conn = _get_conn()
    cur = conn.execute("SELECT * FROM users WHERE api_key = ?", (api_key,))
    row = cur.fetchone()
    if not row:
        return None
    cols = [d[0] for d in cur.description]
    return dict(zip(cols, row))
