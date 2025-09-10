"""
文件作用：数据库初始化与会话管理，默认使用 SQLite，可通过环境变量切换 PostgreSQL。
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase


class Base(DeclarativeBase):
    pass


def _get_db_url() -> str:
    url = os.getenv("DATABASE_URL")
    if url:
        return url
    # 默认 SQLite 本地文件
    return "sqlite:///./data.db"


ENGINE = create_engine(_get_db_url(), future=True)
SessionLocal = sessionmaker(bind=ENGINE, autoflush=False, autocommit=False, future=True)


def init_db() -> None:
    from .models import AgentModel  # noqa: F401 引入以创建表
    Base.metadata.create_all(bind=ENGINE)


