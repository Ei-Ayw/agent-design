"""
文件作用：工具（函数调用）路由（CRUD、/test、/invoke 占位）。
"""

import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from ..schemas.tool import Tool, ToolCreate, ToolUpdate
from jsonschema import validate as jsonschema_validate, ValidationError


router = APIRouter(prefix="/tools", tags=["tools"])

DB: dict[str, Tool] = {}


@router.get("", response_model=List[Tool])
def list_tools():
    return list(DB.values())


@router.post("", response_model=Tool)
def create_tool(payload: ToolCreate):
    tool_id = str(uuid.uuid4())
    tool = Tool(id=tool_id, **payload.model_dump())
    DB[tool_id] = tool
    return tool


@router.get("/{tool_id}", response_model=Tool)
def get_tool(tool_id: str):
    tool = DB.get(tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool


@router.put("/{tool_id}", response_model=Tool)
def update_tool(tool_id: str, payload: ToolUpdate):
    tool = DB.get(tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    data = tool.model_dump()
    data.update({k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None})
    updated = Tool(**data)
    DB[tool_id] = updated
    return updated


@router.delete("/{tool_id}")
def delete_tool(tool_id: str):
    if tool_id in DB:
        del DB[tool_id]
    return {"deleted": True}


@router.post("/test")
def test_tool(payload: Dict[str, Any]):
    return {"ok": True, "echo": payload}


@router.post("/{tool_id}/invoke")
def invoke_tool(tool_id: str, args: Dict[str, Any]):
    tool = DB.get(tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    try:
        jsonschema_validate(instance=args, schema=tool.schema or {"type": "object"})
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Schema validation failed: {e.message}")
    return {"tool": tool_id, "args": args, "result": "placeholder"}


