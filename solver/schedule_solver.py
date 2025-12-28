# solver/schedule_solver.py
import json
import sys
from typing import Any, Dict, List

from ortools.sat.python import cp_model


def is_early(slot: Dict[str, Any]) -> bool:
    # דוגמה: start_time הוא שעה מספרית (למשל 17.5 = 17:30)
    return slot["start_time"] <= 18


def is_indoor(slot: Dict[str, Any]) -> bool:
    # דוגמה פשוטה: תחליף ללוגיקה אמיתית אצלך
    loc = (slot.get("location") or "").lower()
    return ("outdoor" not in loc) and ("מגרש" not in loc)


def solve(
    teams: List[Dict[str, Any]],
    slots: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    model = cp_model.CpModel()

    # --- סלוטים פנויים בלבד ---
    avail_slots = [s for s in slots if not s.get("isBooked", False)]

    # --- כמה אימונים חסרים לכל קבוצה ---
    needed: List[int] = []
    for t in teams:
        desired = int(t["desired_sessions"])
        scheduled_len = len(t.get("scheduled_sessions") or [])
        needed.append(max(0, desired - scheduled_len))

    # --- משתנים בינאריים: x[(ti, si)] ---
    # 1 = קבוצה ti שובצה לסלוט si
    x: Dict[tuple[int, int], cp_model.IntVar] = {}

    for ti, t in enumerate(teams):
        if needed[ti] == 0:
            continue

        for si, s in enumerate(avail_slots):
            # פילטרים קשיחים (לא יוצרים משתנה אם אסור)
            if t.get("isYoung") and not is_early(s):
                continue
            if t.get("noOutdoor") and not is_indoor(s):
                continue

            x[(ti, si)] = model.NewBoolVar(f"x_t{ti}_s{si}")

    # ------------------------------------------------
    # אילוץ 1: כל סלוט לכל היותר קבוצה אחת
    # ------------------------------------------------
    for si in range(len(avail_slots)):
        vars_for_slot = [
            x[(ti, si)]
            for (ti, si2) in x.keys()
            if si2 == si
        ]
        if vars_for_slot:
            model.Add(sum(vars_for_slot) <= 1)

    # ------------------------------------------------
    # אילוץ 2: לכל קבוצה עד מספר האימונים הדרוש
    # ------------------------------------------------
    for ti in range(len(teams)):
        vars_for_team = [
            x[(ti, si)]
            for (ti2, si) in x.keys()
            if ti2 == ti
        ]
        if vars_for_team:
            model.Add(sum(vars_for_team) <= needed[ti])

    # ------------------------------------------------
    # אילוץ 3: קבוצה לא יכולה להתאמן פעמיים באותו יום
    # ------------------------------------------------
    days = set(slot["day"] for slot in avail_slots)

    for ti, _team in enumerate(teams):
        for day in days:
            vars_same_day = [
                x[(ti, si)]
                for (ti2, si) in x.keys()
                if ti2 == ti and avail_slots[si]["day"] == day
            ]

            if vars_same_day:
                model.Add(sum(vars_same_day) <= 1)

    # ------------------------------------------------
    # פונקציית מטרה (Objective)
    # ------------------------------------------------
    # מטרה עיקרית: למקסם מספר אימונים ששובצו בפועל
    total_assigned = sum(x.values()) if x else 0

    # בונוס קטן (אופציונלי): צעירים מוקדם
    early_bonus_terms = []
    for (ti, si), var in x.items():
        t = teams[ti]
        s = avail_slots[si]
        if t.get("isYoung") and is_early(s):
            early_bonus_terms.append(var)

    model.Maximize(
        1000 * total_assigned +
        1 * sum(early_bonus_terms)
    )

    # ------------------------------------------------
    # פתרון
    # ------------------------------------------------
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10.0
    solver.parameters.num_search_workers = 8

    status = solver.Solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return []

    # ------------------------------------------------
    # בניית הפלט
    # ------------------------------------------------
    assignments: List[Dict[str, Any]] = []

    for (ti, si), var in x.items():
        if solver.Value(var) == 1:
            t = teams[ti]
            s = avail_slots[si]
            assignments.append({
                "team_number": t["team_number"],
                "day": s["day"],
                "start_time": s["start_time"],
                "end_time": s["end_time"],
                "location": s["location"],
            })

    return assignments


def main():
    payload = json.loads(sys.stdin.read())
    teams = payload["teams"]
    slots = payload["slots"]

    result = solve(teams, slots)

    sys.stdout.write(
        json.dumps({"assignments": result}, ensure_ascii=False)
    )


if __name__ == "__main__":
    main()
