"""
文件作用：基础健康检查与就绪检查路由，便于 K8s/容器探针与外部监控。
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/live")
def liveness():
    """存活探针：返回固定 OK，进程存活即可通过。"""
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@router.get("/ready")
def readiness():
    """就绪探针：后续可追加依赖检查（DB/Redis/外部服务）。"""
    return {"status": "ready", "time": datetime.utcnow().isoformat()}


