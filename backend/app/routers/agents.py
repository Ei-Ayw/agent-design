"""
文件作用：Agent 相关路由（CRUD 与 /run SSE 占位实现）。
"""

import asyncio
import uuid
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from ..schemas.agent import Agent, AgentCreate, AgentUpdate
from ..auth import require_roles
from ..security import dlp_check, prompt_injection_guard
from .tools import DB as TOOL_DB
from jsonschema import validate as jsonschema_validate, ValidationError
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..models import AgentModel


router = APIRouter(prefix="/agents", tags=["agents"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=List[Agent])
def list_agents(db: Session = Depends(get_db)):
    rows = db.query(AgentModel).all()
    return [Agent(id=r.id, name=r.name, description=r.description, system_prompt=r.system_prompt, model=r.model, version=r.version, metadata=r.metadata_json or {}) for r in rows]


@router.post("", response_model=Agent, dependencies=[Depends(require_roles("basic"))])
def create_agent(payload: AgentCreate, db: Session = Depends(get_db)):
    dlp_check(payload.system_prompt)
    prompt_injection_guard(payload.system_prompt)
    agent_id = str(uuid.uuid4())
    row = AgentModel(id=agent_id, name=payload.name, description=payload.description, system_prompt=payload.system_prompt, model=payload.model, version=1, metadata_json={})
    db.add(row)
    db.commit()
    return Agent(id=agent_id, **payload.model_dump())


@router.get("/{agent_id}", response_model=Agent)
def get_agent(agent_id: str, db: Session = Depends(get_db)):
    r = db.get(AgentModel, agent_id)
    if not r:
        raise HTTPException(status_code=404, detail="Agent not found")
    return Agent(id=r.id, name=r.name, description=r.description, system_prompt=r.system_prompt, model=r.model, version=r.version, metadata=r.metadata_json or {})


@router.put("/{agent_id}", response_model=Agent, dependencies=[Depends(require_roles("basic"))])
def update_agent(agent_id: str, payload: AgentUpdate, db: Session = Depends(get_db)):
    r = db.get(AgentModel, agent_id)
    if not r:
        raise HTTPException(status_code=404, detail="Agent not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        if v is None:
            continue
        setattr(r, k, v)
    db.commit()
    return Agent(id=r.id, name=r.name, description=r.description, system_prompt=r.system_prompt, model=r.model, version=r.version, metadata=r.metadata_json or {})


@router.delete("/{agent_id}", dependencies=[Depends(require_roles("basic"))])
def delete_agent(agent_id: str, db: Session = Depends(get_db)):
    r = db.get(AgentModel, agent_id)
    if not r:
        return {"deleted": False}
    db.delete(r)
    db.commit()
    return {"deleted": True}


@router.post("/{agent_id}/tools")
def bind_tool(agent_id: str, tool_id: str, user=Depends(require_roles("basic")), db: Session = Depends(get_db)):
    r = db.get(AgentModel, agent_id)
    if not r:
        raise HTTPException(status_code=404, detail="Agent not found")
    meta = dict(r.metadata_json or {})
    tools = set(meta.get("tools", []))
    tools.add(tool_id)
    meta["tools"] = list(tools)
    r.metadata_json = meta
    db.commit()
    return Agent(id=r.id, name=r.name, description=r.description, system_prompt=r.system_prompt, model=r.model, version=r.version, metadata=meta)


async def _run_stream(agent: Agent):
    tools = list(agent.metadata.get("tools", []))
    if not tools:
        for i in range(3):
            yield f"data: {{\"agent_id\": \"{agent.id}\", \"delta\": \"step {i+1}\"}}\n\n"
            await asyncio.sleep(0.4)
        return
    for tid in tools:
        tool = TOOL_DB.get(tid)
        if not tool:
            yield f"data: {{\"warning\": \"tool {tid} not found\"}}\n\n"
            continue
        args = {}
        try:
            jsonschema_validate(instance=args, schema=tool.schema or {"type": "object"})
            yield f"data: {{\"tool\": \"{tool.name}\", \"status\": \"validated\"}}\n\n"
        except ValidationError as e:
            yield f"data: {{\"tool\": \"{tool.name}\", \"error\": \"{e.message}\"}}\n\n"
        await asyncio.sleep(0.3)


@router.get("/{agent_id}/run")
async def run_agent(agent_id: str):
    agent = DB.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return StreamingResponse(_run_stream(agent), media_type="text/event-stream")


