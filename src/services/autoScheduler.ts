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
  delayMs = 1000,
}: {
  onProgress?: ProgressCallback;
  delayMs?: number;
} = {}) {
  const updateProgress = (status: string, progress: number) => {
    onProgress?.({ status, progress });
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  updateProgress('מתחיל תהליך שיבוץ...', 0);

  // 1. קבלת כל הקבוצות
  updateProgress('אוסף נתונים על קבוצות...', 20);
  const teamsResponse = await fetch('/api/teams');
  if (!teamsResponse.ok) throw new Error('נכשל בטעינת נתוני הקבוצות');
  const teams: Team[] = await teamsResponse.json();
  await sleep(delayMs);

  // 2. קבלת כל הסלוטים הפנויים
  updateProgress('בודק זמינות אולמות...', 40);
  const slotsResponse = await fetch('/api/slots');
  if (!slotsResponse.ok) throw new Error('נכשל בטעינת נתוני הסלוטים');
  const slots: Slot[] = await slotsResponse.json();
  await sleep(delayMs);

  // 3. אלגוריתם שיבוץ חכם
  updateProgress('מחשב אילוצים ומבצע שיבוץ אופטימלי...', 60);

  // מיון הקבוצות לפי מספר האימונים הדרוש (יורד)
  const sortedTeams = [...teams].sort(
    (a, b) =>
      b.desired_sessions - b.scheduled_sessions.length -
      (a.desired_sessions - a.scheduled_sessions.length)
  );

  // מיון הסלוטים הפנויים
  const availableSlots = slots.filter((slot) => !slot.isBooked);

  // שיבוץ לכל קבוצה
  for (const team of sortedTeams) {
    const neededSessions = team.desired_sessions - team.scheduled_sessions.length;
    if (neededSessions <= 0) continue;

    // בחירת סלוטים מתאימים לקבוצה
    const teamSlots = availableSlots
      .filter((slot) => !slot.isBooked)
      .slice(0, neededSessions);

    if (teamSlots.length > 0) {
      // שיבוץ הסלוטים לקבוצה
      const assignments = teamSlots.map((slot) => ({
        team_number: team.team_number,
        ...slot,
      }));

      // עדכון הסלוטים כתפוסים
      const assignResponse = await fetch('/api/assign-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments }),
      });

      if (!assignResponse.ok) {
        throw new Error('נכשל בשיבוץ הקבוצות');
      }

      // סימון הסלוטים כתפוסים
      assignments.forEach((assignment) => {
        const slotIndex = availableSlots.findIndex(
          (s) =>
            s.day === assignment.day &&
            s.start_time === assignment.start_time &&
            s.location === assignment.location
        );
        if (slotIndex !== -1) {
          availableSlots[slotIndex].isBooked = true;
        }
      });
    }
  }

  updateProgress('השיבוץ הושלם בהצלחה!', 100);
}
