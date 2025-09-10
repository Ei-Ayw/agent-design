"""
文件作用：集中读取与校验后端配置项（环境变量），避免在业务代码中散落读取。
设计要点：
- 仅从环境变量读取，不在代码中写入明文密钥；支持 .env 文件（开发环境）加载。
- 提供类型与默认值，便于可维护与可测试。
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    """集中式配置对象。

    使用 pydantic-settings 自动从环境变量与 .env 文件加载。
    生产环境建议通过容器环境或密钥管理服务（如 Vault/KMS）注入。
    """

    # 基础服务配置
    app_name: str = Field(default="Agent Orchestrator API")
    environment: str = Field(default="dev")
    debug: bool = Field(default=True)
    log_level: str = Field(default="INFO")

    # 腾讯云相关（只声明键名，不放置默认密钥）
    tencentcloud_secret_id: Optional[str] = Field(default=None, alias="TENCENTCLOUD_SECRET_ID")
    tencentcloud_secret_key: Optional[str] = Field(default=None, alias="TENCENTCLOUD_SECRET_KEY")
    tencentcloud_region: str = Field(default="ap-guangzhou", alias="TENCENTCLOUD_REGION")
    tencentcloud_lke_endpoint: str = Field(default="lkeap.tencentcloudapi.com", alias="TENCENTCLOUD_LKE_ENDPOINT")
    tencentcloud_deepseek_model: str = Field(default="deepseek-r1", alias="TENCENTCLOUD_DEEPSEEK_MODEL")

    # 其他外部能力
    hyperbrowser_api_key: Optional[str] = Field(default=None, alias="HYPERBROWSER_API_KEY")

    # 可选的缓存/队列等
    redis_url: str = Field(default="redis://localhost:6379/0")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()


