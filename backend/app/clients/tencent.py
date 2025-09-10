"""
文件作用：腾讯云相关客户端封装（占位实现）。

设计目标：
- 从集中配置（环境变量）读取密钥与区域/Endpoint，不在代码中硬编码明文。
- 使用 httpx（异步）作为基础请求库，后续可替换为官方 SDK。
- 统一请求超时、重试与日志钩子，便于可观测与治理。

注意：当前不落地真实签名逻辑（TC3-HMAC-SHA256），仅保留接口形态与注释说明，
     以避免在未配置密钥时误调用外部服务。生产环境请实现签名或接入官方 SDK。
"""

from typing import Any, Dict, Optional
import httpx
from loguru import logger
from ..config import settings


class TencentCloudClient:
    """腾讯云通用客户端占位。

    - 读取密钥：从环境变量注入（建议使用 Vault/KMS）。
    - 超时与重试：基础超时配置，重试逻辑可在生产阶段接入。
    """

    def __init__(
        self,
        secret_id: Optional[str] = None,
        secret_key: Optional[str] = None,
        region: Optional[str] = None,
        endpoint: Optional[str] = None,
    ) -> None:
        self.secret_id = secret_id or settings.tencentcloud_secret_id
        self.secret_key = secret_key or settings.tencentcloud_secret_key
        self.region = region or settings.tencentcloud_region
        self.endpoint = endpoint or settings.tencentcloud_lke_endpoint
        self._client = httpx.AsyncClient(timeout=httpx.Timeout(15.0))

    async def close(self) -> None:
        await self._client.aclose()

    async def invoke_lke(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """调用腾讯云 LKE 相关接口（占位）。

        说明：
        - 需要实现 TC3-HMAC-SHA256 签名并设置 Header（X-TC-Action、X-TC-Region 等）。
        - 此处仅返回占位响应，避免误调用。
        """
        logger.info("[TCloud] Skipped real call. Action={}, Endpoint={}", action, self.endpoint)
        return {
            "skipped": True,
            "action": action,
            "endpoint": self.endpoint,
            "region": self.region,
            "note": "Placeholder client. Implement TC3 signing or use official SDK in production.",
            "request": payload,
        }


async def get_tencent_client() -> TencentCloudClient:
    """依赖注入工厂：返回客户端实例。由路由按需关闭。"""
    return TencentCloudClient()


