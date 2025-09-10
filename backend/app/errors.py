"""
文件作用：全局错误处理与标准响应结构。
"""

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette import status


def http_error_handler(request: Request, exc):
    return JSONResponse(status_code=getattr(exc, 'status_code', 500), content={
        "error": getattr(exc, 'detail', str(exc)),
        "path": request.url.path,
    })


def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={
        "error": "validation_error",
        "details": exc.errors(),
        "path": request.url.path,
    })


