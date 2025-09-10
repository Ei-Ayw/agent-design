"""
文件作用：最简内存审计事件存储，便于 /audits 查询与回放占位。
"""

from typing import List, Dict, Any
from threading import RLock

_EVENTS: List[Dict[str, Any]] = []
_LOCK = RLock()


def add_event(event: Dict[str, Any]) -> None:
    with _LOCK:
        _EVENTS.append(event)
        # 限制最多 1000 条，避免内存增长
        if len(_EVENTS) > 1000:
            del _EVENTS[: len(_EVENTS) - 1000]


def list_events() -> List[Dict[str, Any]]:
    with _LOCK:
        return list(_EVENTS)


