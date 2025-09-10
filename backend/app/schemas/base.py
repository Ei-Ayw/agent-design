"""
文件作用：通用基础模型与分页/元信息定义，供各业务模型复用。
"""

from pydantic import BaseModel, Field
from typing import Optional, Generic, TypeVar, List


class Meta(BaseModel):
    request_id: Optional[str] = None


T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: List[T]
    total: int = Field(ge=0, default=0)
    page: int = Field(ge=1, default=1)
    size: int = Field(ge=1, le=200, default=20)


