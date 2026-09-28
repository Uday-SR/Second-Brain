"""Verify the same JWT the Node backend issues, so each user only sees their own data."""
from __future__ import annotations

import jwt
from fastapi import Header, HTTPException

from app.config import JWT_SECRET


def get_user_id(authorization: str = Header(default="")) -> int:
    if not JWT_SECRET:
        raise HTTPException(500, "JWT_SECRET is not configured on the AI service.")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(401, "Missing bearer token. Please sign in.")

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token. Please sign in again.")

    user_id = payload.get("id")
    if user_id is None:
        raise HTTPException(401, "Invalid token.")
    return int(user_id)
