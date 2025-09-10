"""
文件作用：提供最小可运行的 SSE（Server-Sent Events）示例路由，
用于演示流式响应与前后端集成方式。
"""

import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/sse", tags=["sse"])


async def _event_stream():
    """示例事件流：每 0.5 秒输出一条消息，共 5 条。"""
    for i in range(5):
        yield f"data: {{\"step\": {i+1}, \"message\": \"hello sse\"}}\n\n"
        await asyncio.sleep(0.5)


@router.get("/demo")
async def sse_demo():
    """SSE Demo：前端可通过 EventSource 订阅。"""
    return StreamingResponse(_event_stream(), media_type="text/event-stream")


