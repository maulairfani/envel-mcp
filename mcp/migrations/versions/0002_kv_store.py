"""Add mcp_kv_store for persistent OAuth client storage

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-01
"""
from alembic import op

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS mcp_kv_store (
            collection TEXT NOT NULL DEFAULT '',
            key        TEXT NOT NULL,
            value      TEXT NOT NULL,
            expires_at DOUBLE PRECISION,
            PRIMARY KEY (collection, key)
        )
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS mcp_kv_store")
