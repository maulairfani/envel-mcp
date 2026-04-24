from datetime import datetime

from fastapi import APIRouter, Depends, Query

from envel_platform.auth import require_user
from envel_platform.db import get_daily_expenses

router = APIRouter()


@router.get("/daily-expenses")
async def daily_expenses(
    username: str = Depends(require_user),
    period: str = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
):
    if not period:
        period = datetime.now().strftime("%Y-%m")
    return get_daily_expenses(username, period=period)
