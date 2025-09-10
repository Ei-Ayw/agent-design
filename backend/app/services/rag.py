"""
文件作用：RAG 服务占位（检索/重排/压缩）。
"""

from typing import List


def retrieve(query: str) -> List[str]:
    # 占位：返回静态片段
    return [f"chunk for: {query}"]


def rerank(chunks: List[str]) -> List[str]:
    return chunks


def compress(chunks: List[str]) -> str:
    return "\n".join(chunks)


