"""
文件作用：Auth 路由，提供最小登录与刷新占位。
"""

from fastapi import APIRouter
from pydantic import BaseModel
from ..auth import create_token


router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(req: LoginRequest):
    # 演示：固定返回一个携带 basic 角色的 JWT
    token = create_token(sub=req.username, roles=["basic"]) 
    return {"access_token": token, "token_type": "bearer"}


@router.post("/refresh")
def refresh():
    token = create_token(sub="user", roles=["basic"]) 
    return {"access_token": token, "token_type": "bearer"}


