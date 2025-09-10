"""
文件作用：最小 JWT 鉴权与 RBAC 依赖占位。
说明：生产环境应接入 OIDC/SAML 或外部 IdP，这里仅提供演示用 JWT。
"""

import time
from typing import Optional, List, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


JWT_SECRET = "dev-secret-change-me"
JWT_ALG = "HS256"
security = HTTPBearer(auto_error=False)


def create_token(sub: str, roles: Optional[List[str]] = None, ttl_seconds: int = 3600) -> str:
    now = int(time.time())
    payload = {"sub": sub, "roles": roles or [], "iat": now, "exp": now + ttl_seconds}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return payload


def require_roles(*roles: str):
    def checker(user: dict = Depends(get_current_user)):
        user_roles = set(user.get("roles", []))
        if not set(roles).issubset(user_roles):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user
    return checker


def require_abac(resource: str, action: str):
    """极简 ABAC 占位：基于用户声明与资源标签判断。

    生产应接入策略引擎（如 OPA/自研），此处仅示例。
    """
    def checker(user: Dict[str, Any] = Depends(get_current_user)):
        # 演示：允许 basic 对大多数资源的 read，写入需 basic 且 action!=admin
        roles = set(user.get("roles", []))
        if action in ("create", "update", "delete") and "basic" not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="ABAC deny")
        return user
    return checker


