"""
Tambah user baru ke users.json.

Usage:
    python scripts/add_user.py
"""
import json
import sys
from pathlib import Path

# ── Isi di sini ──────────────────────────────────────────────────────────────
USERNAME = "irfani"
PASSWORD = "ganti-password-ini"
DB_PATH  = str(Path(__file__).parent.parent / "users" / "irfani.db")
# ─────────────────────────────────────────────────────────────────────────────

USERS_FILE = Path(__file__).parent.parent / "users.json"

users: dict = {}
if USERS_FILE.exists():
    users = json.loads(USERS_FILE.read_text())

if USERNAME in users:
    print(f"User '{USERNAME}' sudah ada. Update? (y/N) ", end="")
    if input().strip().lower() != "y":
        sys.exit(0)

users[USERNAME] = {"password": PASSWORD, "db": DB_PATH}
USERS_FILE.write_text(json.dumps(users, indent=2, ensure_ascii=False))

# Pastikan direktori users ada
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)

print(f"User '{USERNAME}' berhasil ditambahkan ke {USERS_FILE}.")
print(f"DB path: {DB_PATH}")
print(f"PENTING: Ganti password di users.json sebelum deploy!")
