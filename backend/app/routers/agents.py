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


router = APIRouter(prefix="/agents", tags=["agents"])

# 简单内存存储占位，后续替换为数据库
DB: dict[str, Agent] = {}


@router.get("", response_model=List[Agent])
def list_agents():
    return list(DB.values())


@router.post("", response_model=Agent, dependencies=[Depends(require_roles("basic"))])
def create_agent(payload: AgentCreate):
    dlp_check(payload.system_prompt)
    prompt_injection_guard(payload.system_prompt)
    agent_id = str(uuid.uuid4())
    agent = Agent(id=agent_id, **payload.model_dump())
    DB[agent_id] = agent
    return agent


@router.get("/{agent_id}", response_model=Agent)
def get_agent(agent_id: str):
    agent = DB.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.put("/{agent_id}", response_model=Agent, dependencies=[Depends(require_roles("basic"))])
def update_agent(agent_id: str, payload: AgentUpdate):
    agent = DB.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    data = agent.model_dump()
    data.update({k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None})
    updated = Agent(**data)
    DB[agent_id] = updated
    return updated


@router.delete("/{agent_id}", dependencies=[Depends(require_roles("basic"))])
def delete_agent(agent_id: str):
    if agent_id in DB:
        del DB[agent_id]
    return {"deleted": True}


@router.post("/{agent_id}/tools")
def bind_tool(agent_id: str, tool_id: str, user=Depends(require_roles("basic"))):
    agent = DB.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    # 占位：写入 metadata 记录绑定
    meta = dict(agent.metadata)
    tools = set(meta.get("tools", []))
    tools.add(tool_id)
    meta["tools"] = list(tools)
    updated = agent.model_copy(update={"metadata": meta})
    DB[agent_id] = updated
    return updated


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


