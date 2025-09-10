"""
文件作用：RAG 服务占位（检索/重排/压缩）。
"""

from typing import List, Tuple


def bm25_search(query: str) -> List[Tuple[str, float]]:
    # 占位：BM25 返回（文本, 分数）
    return [(f"bm25 chunk for: {query}", 1.0)]


def vector_search(query: str) -> List[Tuple[str, float]]:
    # 占位：向量检索返回（文本, 相似度）
    return [(f"vector chunk for: {query}", 0.9)]


def hybrid_retrieve(query: str) -> List[str]:
    # 简单合并去重
    items = [t for t, _ in bm25_search(query) + vector_search(query)]
    seen, out = set(), []
    for it in items:
        if it not in seen:
            seen.add(it)
            out.append(it)
    return out


def rerank(chunks: List[str]) -> List[str]:
    return chunks


def compress(chunks: List[str]) -> str:
    return "\n".join(chunks)


