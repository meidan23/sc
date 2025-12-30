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
    try:
        assignments = solve(payload.teams, payload.slots)
        return {"assignments": assignments}
    except Exception as e:
        traceback.print_exc()
        raise e
