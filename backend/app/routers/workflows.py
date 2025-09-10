"""
文件作用：Workflow 路由（CRUD、/run、/replay 占位）。
"""

import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from ..services import workflow as wf
from ..auth import require_abac


router = APIRouter(prefix="/workflows", tags=["workflows"])

DB: dict[str, Dict[str, Any]] = {}


@router.get("", response_model=List[Dict[str, Any]])
def list_workflows():
    return list(DB.values())


@router.post("", response_model=Dict[str, Any])
def create_workflow(payload: Dict[str, Any]):
    wid = str(uuid.uuid4())
    wf = {"id": wid, **payload}
    DB[wid] = wf
    return wf


@router.get("/{wid}", response_model=Dict[str, Any])
def get_workflow(wid: str):
    wf = DB.get(wid)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf


@router.post("/{wid}/run", dependencies=[require_abac("workflow", "create")])
def run_workflow(wid: str):
    if wid not in DB:
        raise HTTPException(status_code=404, detail="Workflow not found")
    spec = DB[wid]
    run = wf.start_run(wid, spec)
    return run


@router.post("/{wid}/replay", dependencies=[require_abac("workflow", "create")])
def replay_workflow(wid: str, run_id: str):
    if wid not in DB:
        raise HTTPException(status_code=404, detail="Workflow not found")
    old = wf.get_run(run_id)
    if not old:
        raise HTTPException(status_code=404, detail="Run not found")
    run = wf.start_run(wid, DB[wid])
    return {"replay_of": run_id, **run}


@router.get("/{wid}/runs", response_model=List[Dict[str, Any]])
def list_workflow_runs(wid: str):
    if wid not in DB:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf.list_runs(wid)


@router.get("/runs/{run_id}", response_model=Dict[str, Any])
def get_workflow_run(run_id: str):
    run = wf.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.post("/runs/{run_id}/approve", dependencies=[require_abac("workflow", "update")])
def approve_run_node(run_id: str, node_id: str):
    run = wf.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    for n in run.get("nodes", []):
        if n.get("node") == node_id and n.get("type") == "approval":
            n["status"] = "approved"
            return {"ok": True, "run": run_id, "node": node_id}
    raise HTTPException(status_code=404, detail="Approval node not found")


