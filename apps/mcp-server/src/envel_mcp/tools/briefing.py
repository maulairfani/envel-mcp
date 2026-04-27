"""User-customizable morning briefing.

The user defines a free-form instruction (e.g. "Recap yesterday's spend and
flag any envelope that's already over budget for the month"). The first
tool call of each day attaches a hint that asks the AI client to execute
the instruction before answering the user's actual request — see
`attach_briefing_hint` in deps.py for the trigger mechanism.
"""

from envel_mcp.database import Database


def get_morning_briefing(db: Database) -> dict:
    row = db.fetchone(
        """
        SELECT morning_briefing_enabled    AS enabled,
               morning_briefing_prompt     AS prompt,
               morning_briefing_last_shown AS last_shown
        FROM user_settings WHERE id = 1
        """
    )
    if not row:
        return {"enabled": True, "prompt": None, "last_shown": None}
    return {
        "enabled": bool(row["enabled"]),
        "prompt": row["prompt"],
        "last_shown": row["last_shown"],
    }


def set_morning_briefing(db: Database, prompt: str) -> dict:
    """Save the user's briefing instruction. Auto-enables if previously off."""
    cleaned = (prompt or "").strip()
    if not cleaned:
        raise ValueError("prompt cannot be empty — use clear_morning_briefing to remove")
    db.execute(
        """
        UPDATE user_settings
        SET morning_briefing_prompt = ?,
            morning_briefing_enabled = 1
        WHERE id = 1
        """,
        (cleaned,),
    )
    return get_morning_briefing(db)


def clear_morning_briefing(db: Database) -> dict:
    db.execute(
        "UPDATE user_settings SET morning_briefing_prompt = NULL WHERE id = 1"
    )
    return get_morning_briefing(db)


def set_morning_briefing_enabled(db: Database, enabled: bool) -> dict:
    db.execute(
        "UPDATE user_settings SET morning_briefing_enabled = ? WHERE id = 1",
        (1 if enabled else 0,),
    )
    return get_morning_briefing(db)


# ---------------------------------------------------------------------------
# FastMCP provider
# ---------------------------------------------------------------------------

from fastmcp import FastMCP
from fastmcp.server.context import Context
from fastmcp.server.dependencies import CurrentContext
from envel_mcp.deps import get_user_db

mcp = FastMCP("briefing")


@mcp.tool(name="get_morning_briefing")
async def _get_morning_briefing_mcp(ctx: Context = CurrentContext()) -> dict:
    """Return the user's morning-briefing settings: enabled flag, custom prompt
    (None if not configured), and the date it last fired."""
    await ctx.info("get_morning_briefing")
    with get_user_db() as db:
        return get_morning_briefing(db)


@mcp.tool(name="set_morning_briefing")
async def _set_morning_briefing_mcp(
    prompt: str,
    ctx: Context = CurrentContext(),
) -> dict:
    """Save the user's morning-briefing instruction. The instruction is a
    plain-English description of what they want each morning — be specific
    about which envelopes/tags/timeframes to look at.

    Example: "Cek apakah envelope Makan dan Transport udah lewat 80% dari
    budget bulan ini, dan recap total pengeluaran kemarin."
    """
    await ctx.info(f"set_morning_briefing: prompt_len={len(prompt or '')}")
    with get_user_db() as db:
        return set_morning_briefing(db, prompt)


@mcp.tool(name="clear_morning_briefing")
async def _clear_morning_briefing_mcp(ctx: Context = CurrentContext()) -> dict:
    """Wipe the saved briefing prompt. Keeps the enabled flag as-is — the
    next morning the user will be re-prompted to set one up."""
    await ctx.info("clear_morning_briefing")
    with get_user_db() as db:
        return clear_morning_briefing(db)


@mcp.tool(name="set_morning_briefing_enabled")
async def _set_morning_briefing_enabled_mcp(
    enabled: bool,
    ctx: Context = CurrentContext(),
) -> dict:
    """Toggle the daily-briefing trigger on/off without losing the saved prompt."""
    await ctx.info(f"set_morning_briefing_enabled: {enabled}")
    with get_user_db() as db:
        return set_morning_briefing_enabled(db, enabled)
