"""
文件作用：腾讯云相关 API 路由（占位实现）。

目的：演示如何通过封装客户端调用腾讯云 LKE/DeepSeek 等能力。
安全：不在代码中使用明文密钥；统一从环境变量读取；未实现签名时返回占位响应。
"""

from fastapi import APIRouter, Depends
from typing import Any, Dict
from ..clients.tencent import TencentCloudClient, get_tencent_client


router = APIRouter(prefix="/tcloud", tags=["tencent-cloud"])


@router.get("/lke/test")
async def lke_test(client: TencentCloudClient = Depends(get_tencent_client)) -> Dict[str, Any]:
    """LKE 占位调用：返回调试信息，验证配置是否生效。"""
    payload = {"Prompt": "ping", "Model": "placeholder"}
    return await client.invoke_lke("TestAction", payload)


