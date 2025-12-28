export interface Team {
  team_number: string;
  desired_sessions: number;
  scheduled_sessions: unknown[];
  isYoung?: boolean;
  noOutdoor?: boolean;
}

export interface Slot {
  day: string;
  start_time: number;
  end_time: number;
  location: string;
  isBooked?: boolean;
}

export interface AutoScheduleProgress {
  status: string;
  progress: number;
}

export type ProgressCallback = (update: AutoScheduleProgress) => void;

export async function runAutoSchedule({
  onProgress,
  delayMs = 500,
}: {
  onProgress?: ProgressCallback;
  delayMs?: number;
} = {}) {
  const update = (status: string, progress: number) =>
    onProgress?.({ status, progress });

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  update("אוסף קבוצות...", 10);
  const teamsRes = await fetch("/api/teams");
  if (!teamsRes.ok) throw new Error("שגיאה בטעינת קבוצות");
  const teams: Team[] = await teamsRes.json();
  await sleep(delayMs);

  update("אוסף סלוטים פנויים...", 30);
  const slotsRes = await fetch("/api/slots");
  if (!slotsRes.ok) throw new Error("שגיאה בטעינת סלוטים");
  const slots: Slot[] = await slotsRes.json();
  await sleep(delayMs);

  update("מריץ אלגוריתם שיבוץ חכם (AI)...", 55);
  const solveRes = await fetch("/api/auto-schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teams, slots }),
  });

  if (!solveRes.ok) throw new Error("שגיאה בהרצת האלגוריתם");

  const { assignments } = await solveRes.json();

  update("שומר שיבוצים במערכת...", 85);
  const saveRes = await fetch("/api/assign-slots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignments }),
  });

  if (!saveRes.ok) throw new Error("שגיאה בשמירת שיבוצים");

  update("השיבוץ הושלם בהצלחה!", 100);
}
