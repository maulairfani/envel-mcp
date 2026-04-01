import os

import psycopg2

_DATABASE_URL = os.environ["DATABASE_URL"]


def _conn():
    return psycopg2.connect(_DATABASE_URL)


def _user_conn(github_user_id: str):
    """Connection with RLS user context set."""
    conn = psycopg2.connect(_DATABASE_URL)
    cur = conn.cursor()
    cur.execute("SET app.user_id = %s", (github_user_id,))
    cur.close()
    return conn


def init_db() -> None:
    conn = _conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            github_user_id TEXT PRIMARY KEY,
            github_login    TEXT NOT NULL,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    conn.commit()
    cur.close()
    conn.close()


def upsert_user(github_user_id: str, github_login: str) -> None:
    conn = _conn()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO users (github_user_id, github_login)
        VALUES (%s, %s)
        ON CONFLICT (github_user_id) DO UPDATE SET github_login = EXCLUDED.github_login
        """,
        (github_user_id, github_login),
    )
    conn.commit()
    cur.close()
    conn.close()
    init_user(github_user_id)


def get_user(github_user_id: str) -> dict | None:
    conn = _conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT github_user_id, github_login FROM users WHERE github_user_id = %s",
        (github_user_id,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return None
    return {"github_user_id": row[0], "github_login": row[1]}


def init_user(github_user_id: str) -> None:
    """Insert default envelopes for a new user. Idempotent."""
    conn = _user_conn(github_user_id)
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM envelope_groups")
    if cur.fetchone()[0] > 0:
        cur.close()
        conn.close()
        return

    cur.execute("""
        INSERT INTO envelope_groups (name, sort_order) VALUES
        ('Kebutuhan Tetap',       1),
        ('Kebutuhan Sehari-hari', 2),
        ('Pengeluaran Pribadi',   3),
        ('Tabungan & Goals',      4),
        ('Tidak Terduga',         5)
        RETURNING id, name
    """)
    groups = {name: gid for gid, name in cur.fetchall()}

    cur.execute("""
        INSERT INTO envelopes (name, icon, type, group_id) VALUES
        ('Gaji',         '💼', 'income',  NULL),
        ('Freelance',    '💻', 'income',  NULL),
        ('Investasi',    '📈', 'income',  NULL),
        ('Lainnya',      '💰', 'income',  NULL),
        ('Kos/Sewa',    '🏡', 'expense', %(kt)s),
        ('Tagihan',     '📄', 'expense', %(kt)s),
        ('Langganan',   '🔄', 'expense', %(kt)s),
        ('Kirim Ortu',  '🏠', 'expense', %(kt)s),
        ('Makan',       '🍽️', 'expense', %(ks)s),
        ('Transport',   '🚗', 'expense', %(ks)s),
        ('Belanja',     '🛍️', 'expense', %(pp)s),
        ('Hiburan',     '🎮', 'expense', %(pp)s),
        ('Kesehatan',   '🏥', 'expense', %(pp)s),
        ('Pendidikan',  '📚', 'expense', %(pp)s),
        ('Dana Darurat','🛡️', 'expense', %(tg)s),
        ('Tabungan',    '💎', 'expense', %(tg)s),
        ('Lainnya',     '💸', 'expense', %(tt)s)
    """, {
        'kt': groups['Kebutuhan Tetap'],
        'ks': groups['Kebutuhan Sehari-hari'],
        'pp': groups['Pengeluaran Pribadi'],
        'tg': groups['Tabungan & Goals'],
        'tt': groups['Tidak Terduga'],
    })

    conn.commit()
    cur.close()
    conn.close()
