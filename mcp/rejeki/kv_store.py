"""
PostgreSQL-backed AsyncKeyValue store for FastMCP client_storage.
Persists OAuth client registrations across server restarts.
"""
import json
import time
from collections.abc import Mapping, Sequence
from typing import Any

import asyncpg


class PgKeyValue:
    """Implements the AsyncKeyValue protocol using PostgreSQL."""

    def __init__(self, database_url: str):
        # Convert psycopg2 URL to asyncpg format if needed
        self._url = database_url.replace("postgresql://", "postgres://", 1)
        self._pool: asyncpg.Pool | None = None

    async def _get_pool(self) -> asyncpg.Pool:
        if self._pool is None:
            self._pool = await asyncpg.create_pool(self._url)
            await self._ensure_table()
        return self._pool

    async def _ensure_table(self) -> None:
        pool = self._pool
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS mcp_kv_store (
                    collection TEXT NOT NULL DEFAULT '',
                    key        TEXT NOT NULL,
                    value      TEXT NOT NULL,
                    expires_at DOUBLE PRECISION,
                    PRIMARY KEY (collection, key)
                )
            """)

    def _col(self, collection: str | None) -> str:
        return collection or ""

    async def get(self, key: str, *, collection: str | None = None) -> dict[str, Any] | None:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT value, expires_at FROM mcp_kv_store WHERE collection = $1 AND key = $2",
                self._col(collection), key,
            )
            if row is None:
                return None
            if row["expires_at"] is not None and time.time() > row["expires_at"]:
                await conn.execute(
                    "DELETE FROM mcp_kv_store WHERE collection = $1 AND key = $2",
                    self._col(collection), key,
                )
                return None
            return json.loads(row["value"])

    async def put(self, key: str, value: Mapping[str, Any], *, collection: str | None = None, ttl: float | None = None) -> None:
        pool = await self._get_pool()
        expires_at = time.time() + ttl if ttl is not None else None
        async with pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO mcp_kv_store (collection, key, value, expires_at)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (collection, key) DO UPDATE
                SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at
            """, self._col(collection), key, json.dumps(dict(value)), expires_at)

    async def delete(self, key: str, *, collection: str | None = None) -> bool:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM mcp_kv_store WHERE collection = $1 AND key = $2",
                self._col(collection), key,
            )
            return result.split()[-1] != "0"

    async def get_many(self, keys: Sequence[str], *, collection: str | None = None) -> list[dict[str, Any] | None]:
        return [await self.get(k, collection=collection) for k in keys]

    async def put_many(self, keys: Sequence[str], values: Sequence[Mapping[str, Any]], *, collection: str | None = None, ttl: float | None = None) -> None:
        for k, v in zip(keys, values):
            await self.put(k, v, collection=collection, ttl=ttl)

    async def delete_many(self, keys: Sequence[str], *, collection: str | None = None) -> int:
        count = 0
        for k in keys:
            if await self.delete(k, collection=collection):
                count += 1
        return count

    async def ttl(self, key: str, *, collection: str | None = None) -> tuple[dict[str, Any] | None, float | None]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT value, expires_at FROM mcp_kv_store WHERE collection = $1 AND key = $2",
                self._col(collection), key,
            )
            if row is None:
                return None, None
            remaining = row["expires_at"] - time.time() if row["expires_at"] is not None else None
            return json.loads(row["value"]), remaining

    async def ttl_many(self, keys: Sequence[str], *, collection: str | None = None) -> list[tuple[dict[str, Any] | None, float | None]]:
        return [await self.ttl(k, collection=collection) for k in keys]
