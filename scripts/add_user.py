import secrets
import sys
from pathlib import Path

from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
load_dotenv()

from rejeki.platform_db import init_platform_db, _get_conn  # noqa: E402

# ── Isi di sini ──────────────────────────────────────────────────────────────
USERNAME    = "irfani"
TURSO_URL   = "libsql://testdb-maulairfani.aws-ap-northeast-1.turso.io"
TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzQ3OTIzNjYsImlkIjoiMDE5ZDM5ZGUtMmUwMS03N2NlLWIyODgtYjI4NWJhMDg0ZmQyIiwicmlkIjoiMWYwMjY3NGUtNmUyNy00NDQ3LWJkMjUtMTZhNzEwNWNlMmY4In0.O1jFk0yO_bRqjlAcMFgQL1TEEZxUz-4mOs5uDOKUuGaqj5L6xSfWQwnGmb1pun7sh1rqVH1t9x7lAUBZouDpDg"
API_KEY     = None  # None = auto-generate
# ─────────────────────────────────────────────────────────────────────────────

api_key = API_KEY or secrets.token_urlsafe(32)

init_platform_db()

conn = _get_conn()
conn.execute(
    "INSERT INTO users (username, api_key, turso_url, turso_token) VALUES (?, ?, ?, ?)",
    (USERNAME, api_key, TURSO_URL, TURSO_TOKEN),
)
conn.commit()

print(f"User '{USERNAME}' berhasil ditambahkan.")
print(f"API Key: {api_key}")
