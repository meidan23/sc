# solver/schedule_solver.py
from typing import Any, Dict, List
from ortools.sat.python import cp_model


# --------------------
# Helpers
# --------------------

def is_early(slot: Dict[str, Any]) -> bool:
    return float(slot["start_time"]) <= 18.0


def is_indoor(slot: Dict[str, Any]) -> bool:
    loc = (slot.get("location") or "").lower()
    return "חוץ" not in loc and "outdoor" not in loc


# --------------------
# Core solver
# --------------------

def solve(
    teams: List[Dict[str, Any]],
    slots: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:

    # ---------- Guards ----------
    if not teams or not slots:
        return []

    print(f"[solver] input teams={len(teams)} slots={len(slots)}")

    # normalize slots
    clean_slots = []
    for s in slots:
        if s.get("isBooked"):
            continue
        if "day" not in s:
            raise ValueError("Slot missing 'day'")
        clean_slots.append({
            "day": s["day"],
            "start_time": float(s["start_time"]),
            "end_time": float(s["end_time"]),
            "location": s["location"],
        })

    print(f"[solver] available slots={len(clean_slots)}")
    if not clean_slots:
        print("[solver] no available slots after filtering booked slots")
        return []

    model = cp_model.CpModel()

    # ---------- needed sessions ----------
    needed = []
    for t in teams:
        desired = int(t["desired_sessions"])
        scheduled = t.get("scheduled_sessions") or []
        needed.append(max(0, desired - len(scheduled)))
    total_needed = sum(needed)
    teams_with_need = sum(1 for n in needed if n > 0)
    print(
        "[solver] needed sessions: "
        f"teams_with_need={teams_with_need} total_needed={total_needed}"
    )

    # ---------- decision variables ----------
    # x[(team_index, slot_index)] = 1 if assigned
    x: Dict[tuple, cp_model.IntVar] = {}

    decision_var_count = 0
    skipped_young = 0
    skipped_outdoor = 0
    team_candidate_counts: List[int] = [0] * len(teams)

    for ti, team in enumerate(teams):
        if needed[ti] == 0:
            continue

        for si, slot in enumerate(clean_slots):
            # hard filters
            if team.get("isYoung") and not is_early(slot):
                skipped_young += 1
                continue
            if team.get("noOutdoor") and not is_indoor(slot):
                skipped_outdoor += 1
                continue

            x[(ti, si)] = model.NewBoolVar(f"x_t{ti}_s{si}")
            decision_var_count += 1
            team_candidate_counts[ti] += 1

    if not x:
        print("[solver] no feasible team-slot pairs after filters")
        return []
    print(
        "[solver] candidates: "
        f"decision_vars={decision_var_count} "
        f"skipped_young={skipped_young} skipped_outdoor={skipped_outdoor}"
    )
    if team_candidate_counts:
        min_candidates = min(c for c in team_candidate_counts if c > 0)
        max_candidates = max(team_candidate_counts)
        avg_candidates = sum(team_candidate_counts) / len(team_candidate_counts)
        print(
            "[solver] candidates per team: "
            f"min={min_candidates} avg={avg_candidates:.1f} max={max_candidates}"
        )

    # ---------- constraints ----------

    # 1. each slot max one team
    for si in range(len(clean_slots)):
        vars_for_slot = [
            var for (ti2, si2), var in x.items() if si2 == si
        ]
        if vars_for_slot:
            model.Add(sum(vars_for_slot) <= 1)

    # 2. each team up to needed sessions
    for ti in range(len(teams)):
        vars_for_team = [
            var for (ti2, _), var in x.items() if ti2 == ti
        ]
        if vars_for_team:
            model.Add(sum(vars_for_team) <= needed[ti])

    # 3. ❗ NEW: team cannot train twice on same day
    days = list({s["day"] for s in clean_slots})
    for ti in range(len(teams)):
        for day in days:
            vars_same_day = [
                var
                for (ti2, si), var in x.items()
                if ti2 == ti and clean_slots[si]["day"] == day
            ]
            if vars_same_day:
                model.Add(sum(vars_same_day) <= 1)

    # ---------- objective ----------
    total_assigned = sum(x.values())

    early_bonus = []
    for (ti, si), var in x.items():
        if teams[ti].get("isYoung") and is_early(clean_slots[si]):
            early_bonus.append(var)

    model.Maximize(1000 * total_assigned + sum(early_bonus))

    # ---------- solve ----------
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 8.0
    solver.parameters.num_search_workers = 8

    status = solver.Solve(model)
    status_name = {
        cp_model.OPTIMAL: "OPTIMAL",
        cp_model.FEASIBLE: "FEASIBLE",
        cp_model.INFEASIBLE: "INFEASIBLE",
        cp_model.MODEL_INVALID: "MODEL_INVALID",
        cp_model.UNKNOWN: "UNKNOWN",
    }.get(status, f"STATUS_{status}")

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        print(f"[solver] no solution found (status={status_name})")
        return []

    # ---------- build result ----------
    assignments: List[Dict[str, Any]] = []

    assigned_counts = [0] * len(teams)
    for (ti, si), var in x.items():
        if solver.Value(var) == 1:
            team = teams[ti]
            slot = clean_slots[si]
            assignments.append({
                "team_number": team["team_number"],
                "day": slot["day"],
                "start_time": slot["start_time"],
                "end_time": slot["end_time"],
                "location": slot["location"],
            })
            assigned_counts[ti] += 1

    unmet = [
        {
            "team_number": teams[i]["team_number"],
            "needed": needed[i],
            "assigned": assigned_counts[i],
            "unmet": max(0, needed[i] - assigned_counts[i]),
        }
        for i in range(len(teams))
        if needed[i] > 0
    ]
    total_unmet = sum(entry["unmet"] for entry in unmet)
    worst_unmet = sorted(unmet, key=lambda e: (-e["unmet"], e["team_number"]))[:10]
    print(
        "[solver] result: "
        f"status={status_name} assignments={len(assignments)} "
        f"total_unmet={total_unmet}"
    )
    if worst_unmet:
        print(f"[solver] top_unmet={worst_unmet}")
    return assignments
