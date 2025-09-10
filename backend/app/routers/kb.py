"""
文件作用：知识库（KB）路由（CRUD、文档上载、重建索引占位）。
"""

import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services import rag
from ..security import dlp_check, prompt_injection_guard


router = APIRouter(prefix="/kb", tags=["kb"])

DB: dict[str, Dict[str, Any]] = {}


@router.get("", response_model=List[Dict[str, Any]])
def list_kb():
    return list(DB.values())


@router.post("", response_model=Dict[str, Any])
def create_kb(payload: Dict[str, Any]):
    kid = str(uuid.uuid4())
    kb = {"id": kid, **payload}
    DB[kid] = kb
    return kb


@router.get("/{kid}", response_model=Dict[str, Any])
def get_kb(kid: str):
    kb = DB.get(kid)
    if not kb:
        raise HTTPException(status_code=404, detail="KB not found")
    return kb


@router.post("/{kid}/documents")
def upload_doc(kid: str, meta: Dict[str, Any]):
    if kid not in DB:
        raise HTTPException(status_code=404, detail="KB not found")
    return {"kb": kid, "uploaded": True, "meta": meta}


@router.post("/{kid}/reindex")
def reindex(kid: str):
    if kid not in DB:
        raise HTTPException(status_code=404, detail="KB not found")
    return {"kb": kid, "index_job": str(uuid.uuid4())}


class IngestRequest(BaseModel):
    text: str
    chunk_size: int = 500
    # 多源导入占位参数（Python 3.9 兼容 Optional 写法）
    source: Optional[str] = None  # e.g. notion/confluence/gdrive
    permission_tag: Optional[str] = None  # 权限标签占位


@router.post("/{kid}/documents/ingest")
def ingest_text(kid: str, body: IngestRequest):
    if kid not in DB:
        raise HTTPException(status_code=404, detail="KB not found")
    # 占位：简单分段
    dlp_check(body.text)
    prompt_injection_guard(body.text)
    chunks = [body.text[i:i+body.chunk_size] for i in range(0, len(body.text), body.chunk_size)]
    reranked = rag.rerank(chunks)
    compact = rag.compress(reranked)
    return {"kb": kid, "chunks": len(chunks), "preview": compact[:200], "source": body.source, "permission_tag": body.permission_tag}


@router.get("/{kid}/search")
def kb_search(kid: str, q: str):
    if kid not in DB:
        raise HTTPException(status_code=404, detail="KB not found")
    # 混检占位
    items = rag.hybrid_retrieve(q)
    reranked = rag.rerank(items)
    return {"kb": kid, "query": q, "items": reranked}


