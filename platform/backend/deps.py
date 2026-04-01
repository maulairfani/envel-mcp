import os

from fastapi import Cookie, HTTPException
from jose import JWTError, jwt

JWT_SECRET = os.environ["JWT_SECRET"]
ALGORITHM = "HS256"


def get_current_user(session: str | None = Cookie(default=None)) -> dict:
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return jwt.decode(session, JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid session")
