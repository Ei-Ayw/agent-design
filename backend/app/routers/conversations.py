"""
文件作用：Conversation 路由（CRUD 与 /messages SSE 占位）。
"""

import asyncio
import uuid
from typing import List
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from ..schemas.conversation import Conversation, ConversationCreate, Message


router = APIRouter(prefix="/conversations", tags=["conversations"])

DB: dict[str, Conversation] = {}


@router.get("", response_model=List[Conversation])
def list_conversations():
    return list(DB.values())


@router.post("", response_model=Conversation)
def create_conversation(payload: ConversationCreate):
    conv_id = str(uuid.uuid4())
    conv = Conversation(id=conv_id, agent_id=payload.agent_id, title=payload.title, messages=[])
    DB[conv_id] = conv
    return conv


@router.get("/{conv_id}", response_model=Conversation)
def get_conversation(conv_id: str):
    conv = DB.get(conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.post("/{conv_id}/messages", response_model=Conversation)
def append_message(conv_id: str, msg: Message):
    conv = DB.get(conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv.messages.append(msg)
    DB[conv_id] = conv
    return conv


async def _msg_stream(conv: Conversation):
    for i in range(3):
        yield f"data: {{\"conversation_id\": \"{conv.id}\", \"delta\": \"msg {i+1}\"}}\n\n"
        await asyncio.sleep(0.4)


@router.get("/{conv_id}/messages")
async def stream_messages(conv_id: str):
    conv = DB.get(conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return StreamingResponse(_msg_stream(conv), media_type="text/event-stream")


