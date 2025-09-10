"""
文件作用：ORM 模型定义（起步先实现 Agent）。
"""

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, JSON
from typing import Optional, Dict, Any
from .db import Base


class AgentModel(Base):
    __tablename__ = "agents"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    system_prompt: Mapped[Optional[str]] = mapped_column(String(4000), nullable=True)
    model: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column("metadata", JSON, default={})


