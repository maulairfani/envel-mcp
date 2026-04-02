import sys
from pathlib import Path

from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
load_dotenv()

from rejeki.platform_db import init_platform_db, _get_conn  # noqa: E402

# ── Isi di sini ──────────────────────────────────────────────────────────────
USERNAME  = "irfani"
WORKOS_ID = "user_01KN4J79EDG667XRSCTZJ33KSQ"  # WorkOS user ID
DB_PATH   = "./users/irfani.db"                 # path SQLite file user ini
# ─────────────────────────────────────────────────────────────────────────────

init_platform_db()

conn = _get_conn()
conn.execute(
    "INSERT INTO users (username, workos_id, db_path) VALUES (?, ?, ?)",
    (USERNAME, WORKOS_ID, DB_PATH),
)
conn.commit()
conn.close()

print(f"User '{USERNAME}' berhasil ditambahkan.")
print(f"WorkOS ID: {WORKOS_ID}")
print(f"DB path:   {DB_PATH}")
