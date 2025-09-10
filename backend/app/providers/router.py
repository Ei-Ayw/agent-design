"""
文件作用：Provider Router 占位，按策略选择模型与多模态提供商。
"""

from dataclasses import dataclass
from typing import Optional
from ..config import settings
from dataclasses import replace


@dataclass
class ProviderChoice:
    name: str
    model: str
    endpoint: Optional[str] = None


def choose_llm(task: str, policy: str = "cost") -> ProviderChoice:
    """占位动态策略：按策略返回不同提供商/模型。

    - cost：偏向低成本（默认 DeepSeek 占位）
    - latency：可切至本地/区域近的提供商（占位返回相同）
    - availability：可按健康度降级（占位返回相同）
    """
    choice = ProviderChoice(
        name="tencentcloud",
        model=settings.tencentcloud_deepseek_model,
        endpoint=settings.tencentcloud_lke_endpoint,
    )
    if policy == "latency":
        return replace(choice)
    if policy == "availability":
        return replace(choice)
    return choice


