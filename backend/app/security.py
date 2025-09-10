"""
文件作用：安全占位能力，包括 DLP 与提示注入（Prompt Injection）基础校验。
说明：生产应接入专业 DLP/安全策略引擎与模型评估。
"""

import re
from typing import Optional
from fastapi import HTTPException, status


SENSITIVE_REGEX = re.compile(r"(AKID[0-9A-Za-z]+|SECRET_KEY|password=|passwd=|api[_-]?key)", re.I)
PROMPT_INJECTION_HINTS = [
    "ignore previous",
    "disregard instructions",
    "override system",
]


def dlp_check(text: Optional[str]) -> None:
    if not text:
        return
    if SENSITIVE_REGEX.search(text):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="DLP policy violation")


def prompt_injection_guard(text: Optional[str]) -> None:
    if not text:
        return
    lower = text.lower()
    if any(h in lower for h in PROMPT_INJECTION_HINTS):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt injection detected")


