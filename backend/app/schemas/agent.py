"""
文件作用：Agent 相关的数据模型定义。
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class AgentBase(BaseModel):
    name: str = Field(min_length=1)
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    model: Optional[str] = None


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    model: Optional[str] = None


class Agent(AgentBase):
    id: str
    version: int = 1
    metadata: Dict[str, Any] = {}


