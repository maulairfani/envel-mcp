import datetime

import psycopg2
from fastapi import APIRouter, Depends

from database import _user_conn
from deps import get_current_user

router = APIRouter()


def _rows(cur) -> list[dict]:
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, row)) for row in cur.fetchall()]


@router.get("/accounts")
def get_accounts(user: dict = Depends(get_current_user)):
    conn = _user_conn(user["sub"])
    cur = conn.cursor()
    cur.execute("SELECT id, name, type, balance FROM accounts ORDER BY name")
    result = _rows(cur)
    cur.close()
    conn.close()
    return result


@router.get("/transactions")
def get_transactions(limit: int = 50, user: dict = Depends(get_current_user)):
    conn = _user_conn(user["sub"])
    cur = conn.cursor()
    cur.execute(
        "SELECT id, amount, type, payee, memo, date FROM transactions ORDER BY date DESC, id DESC LIMIT %s",
        (limit,),
    )
    rows = _rows(cur)
    cur.close()
    conn.close()
    # Convert date objects to string
    for r in rows:
        if isinstance(r.get("date"), (datetime.date, datetime.datetime)):
            r["date"] = r["date"].isoformat()
    return rows


@router.get("/summary")
def get_summary(period: str | None = None, user: dict = Depends(get_current_user)):
    if not period:
        period = datetime.date.today().strftime("%Y-%m")

    conn = _user_conn(user["sub"])
    cur = conn.cursor()

    cur.execute(
        "SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'income' AND TO_CHAR(date, 'YYYY-MM') = %s",
        (period,),
    )
    income = cur.fetchone()[0]

    cur.execute(
        "SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'expense' AND TO_CHAR(date, 'YYYY-MM') = %s",
        (period,),
    )
    expense = cur.fetchone()[0]

    cur.close()
    conn.close()
    return {"period": period, "income": float(income), "expense": float(expense), "net": float(income - expense)}
