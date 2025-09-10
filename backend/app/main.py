"""
文件作用：FastAPI 应用入口，注册路由与中间件，暴露运行实例。
运行方式：`uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
说明：仅包含最小可运行骨架，后续将逐步接入 SSE、Agent 路由与第三方能力。
"""

from fastapi import FastAPI
from loguru import logger
from .config import settings
from .routers import health, sse, tencent, agents, conversations, tools, workflows, kb, observability
from .routers import auth as auth_router
from .middleware import request_id_middleware, security_headers_middleware, audit_log_middleware
from .observability import metrics_middleware, metrics_handler
from fastapi.middleware.cors import CORSMiddleware
from .errors import http_error_handler, validation_error_handler
from fastapi.exceptions import RequestValidationError
from fastapi import HTTPException
from .otel import setup_otel


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, debug=settings.debug)

    # 中间件
    app.middleware("http")(request_id_middleware)
    app.middleware("http")(security_headers_middleware)
    app.middleware("http")(audit_log_middleware)
    app.middleware("http")(metrics_middleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 路由注册
    app.include_router(auth_router.router)
    app.include_router(health.router)
    app.include_router(sse.router)
    app.include_router(tencent.router)
    app.include_router(agents.router)
    app.include_router(conversations.router)
    app.include_router(tools.router)
    app.include_router(workflows.router)
    app.include_router(kb.router)
    app.include_router(observability.router)

    # Prometheus 指标暴露端点
    @app.get("/metrics")
    async def metrics():
        return await metrics_handler()

    # 全局错误处理
    app.add_exception_handler(HTTPException, http_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)

    @app.get("/")
    def root():
        return {"name": settings.app_name, "env": settings.environment}

    logger.info("FastAPI app initialized: {}", settings.app_name)
    # OpenTelemetry（可选，设置 OTEL_EXPORTER_OTLP_ENDPOINT 生效）
    try:
        setup_otel(app)
    except Exception:
        logger.warning("OTel not initialized")
    return app


app = create_app()


