"""
文件作用：Workflow 引擎占位（简化的顺序节点执行）。
"""

from typing import List, Dict, Any, Optional
import uuid

# 内存运行历史占位
_RUNS: Dict[str, Dict[str, Any]] = {}


def run_nodes(nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    results = []
    for node in nodes:
        kind = node.get("type")
        if kind == "approval":
            # 人工审批节点：初始为 pending
            results.append({"node": node.get("id"), "type": kind, "status": "pending"})
        else:
            results.append({"node": node.get("id"), "type": kind, "status": "ok"})
    return results


def start_run(workflow_id: str, spec: Dict[str, Any]) -> Dict[str, Any]:
    run_id = str(uuid.uuid4())
    result_nodes = run_nodes(spec.get("nodes", []))
    run = {
        "id": run_id,
        "workflow_id": workflow_id,
        "status": "completed",
        "nodes": result_nodes,
    }
    _RUNS[run_id] = run
    return run


def get_run(run_id: str) -> Optional[Dict[str, Any]]:
    return _RUNS.get(run_id)


def list_runs(workflow_id: str) -> List[Dict[str, Any]]:
    return [r for r in _RUNS.values() if r.get("workflow_id") == workflow_id]


