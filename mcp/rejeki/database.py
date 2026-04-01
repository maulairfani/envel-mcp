import datetime
import os

import psycopg2
import psycopg2.pool
from fastmcp.server.dependencies import get_access_token

_DATABASE_URL = os.environ["DATABASE_URL"]
_pool = psycopg2.pool.ThreadedConnectionPool(2, 20, _DATABASE_URL)


def _get_user_id() -> str:
    token = get_access_token()
    if token is None:
        raise RuntimeError("No authenticated user in current context")
    return token.claims["sub"]


def get_connection():
    github_user_id = _get_user_id()
    conn = _pool.getconn()
    cur = conn.cursor()
    cur.execute("SET app.user_id = %s", (github_user_id,))
    cur.close()
    return conn


def _release(conn):
    _pool.putconn(conn)


def _to_python(val):
    if isinstance(val, (datetime.date, datetime.datetime)):
        return val.isoformat()
    return val


def _row_to_dict(cursor, row) -> dict:
    return {col[0]: _to_python(val) for col, val in zip(cursor.description, row)}


def fetchone(query: str, params: tuple = ()) -> dict | None:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(query.replace("?", "%s"), params or None)
        row = cur.fetchone()
        result = _row_to_dict(cur, row) if row else None
        cur.close()
        return result
    finally:
        _release(conn)


def fetchall(query: str, params: tuple = ()) -> list[dict]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(query.replace("?", "%s"), params or None)
        rows = cur.fetchall()
        result = [_row_to_dict(cur, r) for r in rows]
        cur.close()
        return result
    finally:
        _release(conn)


def execute(query: str, params: tuple = ()) -> int:
    """Execute INSERT/UPDATE/DELETE. Returns inserted row id for INSERTs."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        pg_query = query.replace("?", "%s")
        if pg_query.strip().upper().startswith("INSERT"):
            pg_query += " RETURNING id"
            cur.execute(pg_query, params or None)
            row = cur.fetchone()
            result = row[0] if row else 0
        else:
            cur.execute(pg_query, params or None)
            result = 0
        conn.commit()
        cur.close()
        return result
    finally:
        _release(conn)
