from fastmcp import FastMCP
from fastmcp.server.context import Context
from fastmcp.server.dependencies import CurrentContext
from envel_mcp.deps import get_user_db

mcp = FastMCP("memory")


@mcp.tool(name="get_memory")
async def _get_memory(ctx: Context = CurrentContext()) -> dict:
    """
    Load persistent user memory: spending habits, financial behavior, goals, patterns.
    Call this at the start of every session alongside get_onboarding_status.
    Returns content (markdown) and updated_at timestamp.
    """
    await ctx.info("get_memory")
    with get_user_db() as db:
        row = db.fetchone("SELECT content, updated_at FROM user_memory WHERE id = 1")
        return {"content": row["content"], "updated_at": row["updated_at"]}


@mcp.tool(name="update_memory")
async def _update_memory(content: str, ctx: Context = CurrentContext()) -> dict:
    """
    Overwrite user memory with new content (markdown).
    Use structured sections: ## Spending Habits, ## Financial Goals, ## Behavior Patterns, ## Notes.
    Update when you observe new patterns, recurring behaviors, or changes in goals.
    Preserve all existing observations unless they are clearly outdated.
    """
    await ctx.info("update_memory")
    with get_user_db() as db:
        db.execute(
            "UPDATE user_memory SET content = ?, updated_at = datetime('now') WHERE id = 1",
            (content,),
        )
        return {"ok": True}
