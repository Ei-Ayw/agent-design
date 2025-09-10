"""
文件作用：应用内 Prometheus 指标与请求耗时中间件。
"""

import time
from typing import Callable
from fastapi import Request
from prometheus_client import Counter, Histogram, REGISTRY, generate_latest, CollectorRegistry, CONTENT_TYPE_LATEST
from starlette.responses import Response


HTTP_REQUESTS = Counter('http_requests_total', 'HTTP 请求数量', ['method', 'path', 'status'])
HTTP_LATENCY = Histogram('http_request_duration_seconds', 'HTTP 请求耗时', ['method', 'path'])


async def metrics_handler() -> Response:
    data = generate_latest(REGISTRY)
    return Response(data, media_type=CONTENT_TYPE_LATEST)


async def metrics_middleware(request: Request, call_next: Callable):
    start = time.perf_counter()
    response = await call_next(request)
    duration = time.perf_counter() - start
    path = request.url.path
    method = request.method
    HTTP_REQUESTS.labels(method=method, path=path, status=str(response.status_code)).inc()
    HTTP_LATENCY.labels(method=method, path=path).observe(duration)
    return response


