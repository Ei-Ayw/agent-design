"""
文件作用：可观测性与计费只读占位接口。
"""

from fastapi import APIRouter
from ..audit_store import list_events


router = APIRouter(prefix="", tags=["observability", "billing"])


@router.get("/metrics")
def get_metrics():
    return {"latency_p95_ms": 1200, "success_rate": 0.92, "token_usage": 123456}


@router.get("/traces")
def get_traces():
    return {"traces": []}


@router.get("/audits")
def get_audits():
    return {"events": list_events()}


@router.get("/usage")
def get_usage():
    return {"requests": 1000, "tokens": 500000}


@router.get("/costs")
def get_costs():
    return {"usd_month": 123.45}


