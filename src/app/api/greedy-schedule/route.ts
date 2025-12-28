import { NextResponse } from "next/server";

type Team = {
  team_number: string;
  desired_sessions: number;
  scheduled_sessions?: unknown[];
  isYoung?: boolean;
  noOutdoor?: boolean;
};

type Slot = {
  day: string;
  start_time: number;
  end_time: number;
  location: string;
  isBooked?: boolean;
};

type Assignment = {
  team_number: string;
  day: string;
  start_time: number;
  end_time: number;
  location: string;
};

const isEarly = (slot: Slot) => slot.start_time <= 18;

const isIndoor = (slot: Slot) => {
  const loc = (slot.location || "").toLowerCase();
  return !loc.includes("outdoor") && !loc.includes("מגרש");
};

const bySlotTime = (a: Slot, b: Slot) => {
  if (a.day !== b.day) return a.day.localeCompare(b.day, "he");
  if (a.start_time !== b.start_time) return a.start_time - b.start_time;
  return a.end_time - b.end_time;
};

const byNeededDesc = (a: { needed: number }, b: { needed: number }) =>
  b.needed - a.needed;

export async function POST(req: Request) {
  const { teams, slots } = (await req.json()) as {
    teams: Team[];
    slots: Slot[];
  };

  const availableSlots = (slots || [])
    .filter(slot => !slot.isBooked)
    .sort(bySlotTime);

  const assignments: Assignment[] = [];
  const bookedSlotIds = new Set<string>();

  const teamQueue = (teams || [])
    .map(team => {
      const desired = Number(team.desired_sessions || 0);
      const scheduled = team.scheduled_sessions?.length ?? 0;
      return {
        team,
        needed: Math.max(0, desired - scheduled),
      };
    })
    .filter(entry => entry.needed > 0)
    .sort(byNeededDesc);

  const slotKey = (slot: Slot) =>
    `${slot.day}-${slot.start_time}-${slot.end_time}-${slot.location}`;

  for (const entry of teamQueue) {
    const { team } = entry;
    let remaining = entry.needed;
    const usedDays = new Set<string>();

    for (const slot of availableSlots) {
      if (remaining === 0) break;

      const key = slotKey(slot);
      if (bookedSlotIds.has(key)) continue;
      if (usedDays.has(slot.day)) continue;
      if (team.isYoung && !isEarly(slot)) continue;
      if (team.noOutdoor && !isIndoor(slot)) continue;

      assignments.push({
        team_number: team.team_number,
        day: slot.day,
        start_time: slot.start_time,
        end_time: slot.end_time,
        location: slot.location,
      });

      bookedSlotIds.add(key);
      usedDays.add(slot.day);
      remaining -= 1;
    }
  }

  return NextResponse.json({ assignments });
}
