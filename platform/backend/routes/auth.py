import os
import secrets

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from jose import jwt

from database import get_user, upsert_user
from deps import ALGORITHM, JWT_SECRET, get_current_user

router = APIRouter()

_CLIENT_ID = os.environ["PLATFORM_GITHUB_CLIENT_ID"]
_CLIENT_SECRET = os.environ["PLATFORM_GITHUB_CLIENT_SECRET"]
_FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.get("/github")
def login_github():
    state = secrets.token_urlsafe(16)
    url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={_CLIENT_ID}&scope=read:user,user:email&state={state}"
    )
    resp = RedirectResponse(url=url)
    resp.set_cookie("oauth_state", state, httponly=True, max_age=300, samesite="lax")
    return resp


@router.get("/callback")
async def github_callback(code: str, state: str, request: Request):
    stored = request.cookies.get("oauth_state")
    if not stored or stored != state:
        raise HTTPException(status_code=400, detail="Invalid state")

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://github.com/login/oauth/access_token",
            data={"client_id": _CLIENT_ID, "client_secret": _CLIENT_SECRET, "code": code},
            headers={"Accept": "application/json"},
        )
        access_token = token_resp.json().get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to obtain access token")

        user_resp = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
        )
        user_data = user_resp.json()

    github_user_id = str(user_data["id"])
    github_login = user_data["login"]

    upsert_user(github_user_id, github_login)

    session = jwt.encode({"sub": github_user_id, "login": github_login}, JWT_SECRET, algorithm=ALGORITHM)

    resp = RedirectResponse(url=f"{_FRONTEND_URL}/dashboard")
    resp.set_cookie("session", session, httponly=True, samesite="lax")
    resp.delete_cookie("oauth_state")
    return resp


@router.post("/logout")
def logout():
    from fastapi.responses import JSONResponse
    resp = JSONResponse({"ok": True})
    resp.delete_cookie("session")
    return resp


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return user
