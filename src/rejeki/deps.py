from contextlib import asynccontextmanager

import libsql
from fastmcp import Context
from rejeki.database import Database, init_db


@asynccontextmanager
async def get_user_db(ctx: Context):
    user = ctx.get_state("user")
    if not user:
        raise RuntimeError("User tidak ditemukan di context — pastikan AuthMiddleware terpasang")

    conn = libsql.connect(user["turso_url"], auth_token=user["turso_token"])
    db = Database(conn)
    init_db(db)

    try:
        yield db
    finally:
        db.close()
