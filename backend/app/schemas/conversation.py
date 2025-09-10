"""
文件作用：会话/消息相关的数据模型定义。
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class Message(BaseModel):
    id: str
    role: str = Field(pattern=r"^(user|assistant|system)$")
    content: str
    tool_call: Optional[Dict[str, Any]] = None


class Conversation(BaseModel):
    id: str
    agent_id: str
    title: Optional[str] = None
    messages: List[Message] = []


class ConversationCreate(BaseModel):
    agent_id: str
    title: Optional[str] = None


