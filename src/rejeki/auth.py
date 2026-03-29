from fastmcp.server.middleware import Middleware, MiddlewareContext
from fastmcp.server.dependencies import get_http_headers
from fastmcp.exceptions import ToolError
from rejeki.platform_db import get_user_by_api_key


class AuthMiddleware(Middleware):
    async def on_call_tool(self, context: MiddlewareContext, call_next):
        headers = get_http_headers() or {}
        auth = headers.get("authorization", "")

        if not auth.lower().startswith("bearer "):
            raise ToolError("Missing or invalid Authorization header")

        api_key = auth[7:].strip()
        user = get_user_by_api_key(api_key)

        if not user:
            raise ToolError("Invalid API key")

        if context.fastmcp_context:
            context.fastmcp_context.set_state("user", user)

        return await call_next(context)
