from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict, List
from schedule_solver import solve

app = FastAPI()

class SolveRequest(BaseModel):
    teams: List[Dict[str, Any]]
    slots: List[Dict[str, Any]]

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/solve")
def solve_schedule(payload: SolveRequest):
    return {"assignments": solve(payload.teams, payload.slots)}

@app.post("/solve")
def solve_schedule(payload: SolveRequest):
    try:
        return {"assignments": solve(payload.teams, payload.slots)}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise
