"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2026-04-01
"""
from alembic import op

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None

_FINANCE_TABLES = [
    'accounts', 'envelope_groups', 'envelopes',
    'transactions', 'budget_periods', 'scheduled_transactions',
]


def upgrade() -> None:
    # Platform users table — no RLS, managed by platform backend
    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            github_user_id TEXT PRIMARY KEY,
            github_login    TEXT NOT NULL,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            id         SERIAL PRIMARY KEY,
            user_id    TEXT NOT NULL DEFAULT current_setting('app.user_id'),
            name       TEXT NOT NULL,
            type       TEXT NOT NULL CHECK (type IN ('bank', 'ewallet', 'cash')),
            balance    DOUBLE PRECISION NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS envelope_groups (
            id         SERIAL PRIMARY KEY,
            user_id    TEXT NOT NULL DEFAULT current_setting('app.user_id'),
            name       TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS envelopes (
            id              SERIAL PRIMARY KEY,
            user_id         TEXT NOT NULL DEFAULT current_setting('app.user_id'),
            name            TEXT NOT NULL,
            icon            TEXT,
            type            TEXT NOT NULL CHECK (type IN ('income', 'expense')),
            group_id        INTEGER REFERENCES envelope_groups(id),
            target_type     TEXT CHECK (target_type IN ('monthly', 'goal')),
            target_amount   DOUBLE PRECISION,
            target_deadline TEXT
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id            SERIAL PRIMARY KEY,
            user_id       TEXT NOT NULL DEFAULT current_setting('app.user_id'),
            amount        DOUBLE PRECISION NOT NULL,
            type          TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
            envelope_id   INTEGER REFERENCES envelopes(id),
            account_id    INTEGER NOT NULL REFERENCES accounts(id),
            to_account_id INTEGER REFERENCES accounts(id),
            payee         TEXT,
            memo          TEXT,
            date          DATE NOT NULL DEFAULT CURRENT_DATE
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS budget_periods (
            id          SERIAL PRIMARY KEY,
            user_id     TEXT NOT NULL DEFAULT current_setting('app.user_id'),
            envelope_id INTEGER NOT NULL REFERENCES envelopes(id),
            period      TEXT NOT NULL,
            assigned    DOUBLE PRECISION NOT NULL DEFAULT 0,
            carryover   DOUBLE PRECISION NOT NULL DEFAULT 0,
            UNIQUE(envelope_id, period)
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS scheduled_transactions (
            id             SERIAL PRIMARY KEY,
            user_id        TEXT NOT NULL DEFAULT current_setting('app.user_id'),
            amount         DOUBLE PRECISION NOT NULL,
            type           TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
            envelope_id    INTEGER REFERENCES envelopes(id),
            account_id     INTEGER NOT NULL REFERENCES accounts(id),
            to_account_id  INTEGER REFERENCES accounts(id),
            payee          TEXT,
            memo           TEXT,
            scheduled_date TEXT NOT NULL,
            recurrence     TEXT NOT NULL DEFAULT 'once' CHECK (recurrence IN ('once', 'weekly', 'monthly', 'yearly')),
            is_active      INTEGER NOT NULL DEFAULT 1,
            created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)

    # Enable Row Level Security — all reads/writes filtered by user_id
    for table in _FINANCE_TABLES:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")
        op.execute(f"""
            CREATE POLICY user_isolation ON {table}
            USING (user_id = current_setting('app.user_id', true))
            WITH CHECK (user_id = current_setting('app.user_id', true))
        """)


def downgrade() -> None:
    for table in reversed(_FINANCE_TABLES):
        op.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
    op.execute("DROP TABLE IF EXISTS users CASCADE")
