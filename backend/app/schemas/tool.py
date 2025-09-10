"""
文件作用：工具（函数调用）相关的数据模型定义。
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class ToolBase(BaseModel):
    name: str = Field(min_length=1)
    description: Optional[str] = None
    schema: Dict[str, Any] = {}


class ToolCreate(ToolBase):
    pass


class ToolUpdate(BaseModel):
    description: Optional[str] = None
    schema: Optional[Dict[str, Any]] = None


class Tool(ToolBase):
    id: str


