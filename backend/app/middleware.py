"""
文件作用：应用级中间件（请求 ID、简单访问日志、安全头占位）。
"""

import uuid
from fastapi import Request


async def request_id_middleware(request: Request, call_next):
    rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    response = await call_next(request)
    response.headers["X-Request-ID"] = rid
    return response


async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    return response


async def audit_log_middleware(request: Request, call_next):
    # 占位：最小审计记录（方法、路径、用户代理）
    from .audit_store import add_event
    response = await call_next(request)
    add_event({
        "method": request.method,
        "path": request.url.path,
        "ua": request.headers.get("user-agent"),
        "status": response.status_code,
    })
    response.headers.setdefault("X-Audit", "on")
    return response


