# solver/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict, List
from schedule_solver import solve
import traceback

app = FastAPI()


class SolveRequest(BaseModel):
    teams: List[Dict[str, Any]]
    slots: List[Dict[str, Any]]


@app.get("/")
def health():
    return {"status": "ok"} 


@app.post("/solve")
def solve_schedule(payload: SolveRequest):
    print("[api] /solve called")
    print(f"[api] teams: {len(payload.teams)} slots: {len(payload.slots)}")

    try:
        assignments = solve(payload.teams, payload.slots)
        print(f"[api] assignments returned: {len(assignments)}")
        return {"assignments": assignments}
    except Exception as e:
        import traceback
        print("[api][ERROR] exception during solve")
        traceback.print_exc()
        return {"error": str(e)}
