"""
文件作用：会话/消息相关的数据模型定义。
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class Attachment(BaseModel):
    id: str
    type: str
    url: Optional[str] = None
    meta: Dict[str, Any] = {}


class FunctionCall(BaseModel):
    name: str
    arguments: Dict[str, Any] = {}
    result: Optional[Dict[str, Any]] = None


class Message(BaseModel):
    id: str
    role: str = Field(pattern=r"^(user|assistant|system|tool)$")
    content: str = ""
    function_call: Optional[FunctionCall] = None
    attachments: List[Attachment] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Conversation(BaseModel):
    id: str
    agent_id: str
    title: Optional[str] = None
    messages: List[Message] = []


class ConversationCreate(BaseModel):
    agent_id: str
    title: Optional[str] = None


