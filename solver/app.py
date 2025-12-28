from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from schedule_solver import solve

app = FastAPI()


class SolveRequest(BaseModel):
    teams: List[Dict[str, Any]]
    slots: List[Dict[str, Any]]


class SolveResponse(BaseModel):
    assignments: List[Dict[str, Any]]


@app.get("/")
def health_check() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/solve", response_model=SolveResponse)
def solve_schedule(payload: SolveRequest) -> SolveResponse:
    try:
        assignments = solve(payload.teams, payload.slots)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return SolveResponse(assignments=assignments)
