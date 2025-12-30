/* eslint-disable no-console */
const { MongoClient } = require('mongodb');

/* ===================== DB CONFIG ===================== */

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://meidan23:236952147@cluster0.wd3wl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const DB_NAME = 'sc';

/* ===================== CORE CONSTANTS ===================== */

const TOTAL_TEAMS = 39;

/* ===================== TEAM CONFIG ===================== */

const YOUNG_TEAMS = new Set([
  4, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 34, 35, 36, 37,
]);

const NO_OUTDOOR_TEAMS = new Set([1, 5, 7]);

const SESSIONS_BY_TEAM = new Map([
  [1, 4],
  [5, 4],
  [35, 2],
  [36, 2],
]);

/*
  COACH_GROUPS = מאמנים שמאמנים יותר מקבוצה אחת
*/
const COACH_GROUPS = [
  [2, 3, 4],
  [5, 6],
  [7, 8],
  [9, 10],
  [11, 12],
  [13, 14],
  [15, 16],
  [17, 18],
  [19, 20],
  [21, 22],
  [23, 24],
  [25, 26],
  [27, 28],
  [30, 31],
  [32, 33],
];

/* ===================== HELPERS ===================== */

const isOutdoorVenue = (name) => name.includes('חוץ');

/*
  team_number -> coach_name
*/
const buildCoachByTeam = () => {
  const map = new Map();
  let coachIndex = 0;

  COACH_GROUPS.forEach((group) => {
    const coach = `מאמן ${++coachIndex}`;
    group.forEach((team) => map.set(team, coach));
  });

  for (let team = 1; team <= TOTAL_TEAMS; team++) {
    if (!map.has(team)) {
      map.set(team, `מאמן ${++coachIndex}`);
    }
  }

  return map;
};

const buildCoaches = (coachByTeam) => {
  const map = new Map();

  for (const [team, coach] of coachByTeam.entries()) {
    if (!map.has(coach)) map.set(coach, []);
    map.get(coach).push(team);
  }

  return [...map.entries()].map(([name, teams]) => ({
    name,
    teams: teams.sort((a, b) => a - b),
    created_at: new Date(),
  }));
};

const buildTeams = (coachByTeam) =>
  Array.from({ length: TOTAL_TEAMS }, (_, i) => {
    const team_number = i + 1;
    return {
      team_number,
      coach_name: coachByTeam.get(team_number),
      desired_sessions: SESSIONS_BY_TEAM.get(team_number) ?? 3,
      isYoung: YOUNG_TEAMS.has(team_number),
      noOutdoor: NO_OUTDOOR_TEAMS.has(team_number),
      created_at: new Date(),
    };
  });

/* ===================== SLOT DEFINITIONS (ALL) ===================== */

const SLOT_DEFINITIONS = [
  { slot_number: 1, day: 'יום ראשון', location: 'אולם שדות', start_time: 14.5, end_time: 16 },
  { slot_number: 2, day: 'יום ראשון', location: 'אולם שדות', start_time: 16, end_time: 17.5 },
  { slot_number: 3, day: 'יום ראשון', location: 'אולם שדות', start_time: 17.5, end_time: 19 },
  { slot_number: 4, day: 'יום ראשון', location: 'אולם שדות', start_time: 19, end_time: 20.5 },
  { slot_number: 5, day: 'יום ראשון', location: 'חוץ שדות 1', start_time: 18, end_time: 19.5 },
  { slot_number: 6, day: 'יום ראשון', location: 'חוץ שדות 2', start_time: 18, end_time: 19.5 },
  { slot_number: 7, day: 'יום ראשון', location: 'אולם לב המושבה', start_time: 16, end_time: 17.5 },
  { slot_number: 8, day: 'יום ראשון', location: 'אולם לב המושבה', start_time: 17.5, end_time: 19 },
  { slot_number: 9, day: 'יום ראשון', location: 'אולם לב המושבה', start_time: 19, end_time: 20.5 },
  { slot_number: 10, day: 'יום ראשון', location: 'אולם לב המושבה', start_time: 20.5, end_time: 22 },
  { slot_number: 11, day: 'יום ראשון', location: 'חוץ לב המושבה קאנטרי', start_time: 16, end_time: 17.5 },
  { slot_number: 12, day: 'יום ראשון', location: 'חוץ לב המושבה קאנטרי', start_time: 17.5, end_time: 19 },
  { slot_number: 13, day: 'יום ראשון', location: 'חוץ לב המושבה 1', start_time: 16, end_time: 17.5 },
  { slot_number: 14, day: 'יום ראשון', location: 'חוץ לב המושבה 2', start_time: 16, end_time: 17.5 },
  { slot_number: 15, day: 'יום ראשון', location: 'חוץ לב המושבה 1', start_time: 17.5, end_time: 19 },
  { slot_number: 16, day: 'יום ראשון', location: 'חוץ לב המושבה 2', start_time: 17.5, end_time: 19 },
  { slot_number: 17, day: 'יום ראשון', location: 'חוץ לב המושבה 1', start_time: 19, end_time: 20.5 },
  { slot_number: 18, day: 'יום ראשון', location: 'חוץ לב המושבה 2', start_time: 19, end_time: 20.5 },
  { slot_number: 19, day: 'יום ראשון', location: 'אולם בן גוריון', start_time: 15.5, end_time: 17 },
  { slot_number: 20, day: 'יום ראשון', location: 'אולם בן גוריון', start_time: 17, end_time: 18.5 },
  { slot_number: 21, day: 'יום ראשון', location: 'אולם בן גוריון', start_time: 18.5, end_time: 20 },
  { slot_number: 22, day: 'יום ראשון', location: 'סככת קריית חינוך 1', start_time: 16, end_time: 17.5 },
  { slot_number: 23, day: 'יום ראשון', location: 'סככת קריית חינוך 2', start_time: 16, end_time: 17.5 },
  { slot_number: 24, day: 'יום ראשון', location: 'חוץ ארגמן', start_time: 18.25, end_time: 19.75 },
  { slot_number: 25, day: 'יום ראשון', location: 'אולם הפועל', start_time: 14.5, end_time: 16 },
  { slot_number: 26, day: 'יום ראשון', location: 'אולם הפועל', start_time: 16, end_time: 17.5 },
  { slot_number: 27, day: 'יום ראשון', location: 'אולם הפועל', start_time: 17.5, end_time: 19 },
  { slot_number: 28, day: 'יום ראשון', location: 'אולם הפועל', start_time: 19, end_time: 20.5 },
  { slot_number: 29, day: 'יום ראשון', location: 'אולם הפועל', start_time: 20.5, end_time: 22 },

  { slot_number: 30, day: 'יום שני', location: 'אולם שדות', start_time: 14.5, end_time: 16 },
  { slot_number: 31, day: 'יום שני', location: 'אולם שדות', start_time: 16, end_time: 17.5 },
  { slot_number: 32, day: 'יום שני', location: 'אולם שדות', start_time: 17.5, end_time: 19 },
  { slot_number: 33, day: 'יום שני', location: 'אולם שדות', start_time: 19, end_time: 20.5 },
  { slot_number: 34, day: 'יום שני', location: 'אולם הפועל', start_time: 14.5, end_time: 16 },
  { slot_number: 35, day: 'יום שני', location: 'אולם הפועל', start_time: 16, end_time: 17.5 },
  { slot_number: 36, day: 'יום שני', location: 'אולם הפועל', start_time: 17.5, end_time: 19 },
  { slot_number: 37, day: 'יום שני', location: 'אולם הפועל', start_time: 19, end_time: 20.5 },
  { slot_number: 38, day: 'יום שני', location: 'אולם הפועל', start_time: 20.5, end_time: 22 },
  { slot_number: 39, day: 'יום שני', location: 'חוץ ארגמן', start_time: 19.25, end_time: 20.75 },

  { slot_number: 40, day: 'יום שלישי', location: 'אולם שדות', start_time: 15, end_time: 16.5 },
  { slot_number: 41, day: 'יום שלישי', location: 'אולם שדות', start_time: 16.5, end_time: 18 },
  { slot_number: 42, day: 'יום שלישי', location: 'אולם שדות', start_time: 18, end_time: 19.5 },
  { slot_number: 43, day: 'יום שלישי', location: 'אולם שדות', start_time: 19.5, end_time: 21 },
  { slot_number: 44, day: 'יום שלישי', location: 'חוץ שדות 1', start_time: 17, end_time: 18.5 },
  { slot_number: 45, day: 'יום שלישי', location: 'חוץ שדות 2', start_time: 17, end_time: 18.5 },
  { slot_number: 46, day: 'יום שלישי', location: 'חוץ שדות 1', start_time: 18.5, end_time: 20 },
  { slot_number: 47, day: 'יום שלישי', location: 'חוץ שדות 2', start_time: 18.5, end_time: 20 },
  { slot_number: 48, day: 'יום שלישי', location: 'אולם לב המושבה', start_time: 16, end_time: 17.5 },
  { slot_number: 49, day: 'יום שלישי', location: 'אולם לב המושבה', start_time: 17.5, end_time: 19 },
  { slot_number: 50, day: 'יום שלישי', location: 'אולם לב המושבה', start_time: 19, end_time: 20.5 },
  { slot_number: 51, day: 'יום שלישי', location: 'אולם לב המושבה', start_time: 20.5, end_time: 22 },
  { slot_number: 52, day: 'יום שלישי', location: 'חוץ לב המושבה 1', start_time: 16, end_time: 17.5 },
  { slot_number: 53, day: 'יום שלישי', location: 'חוץ לב המושבה 1', start_time: 17.5, end_time: 19 },
  { slot_number: 54, day: 'יום שלישי', location: 'חוץ לב המושבה 1', start_time: 19, end_time: 20.5 },
  { slot_number: 55, day: 'יום שלישי', location: 'אולם בן גוריון', start_time: 16, end_time: 17.5 },
  { slot_number: 56, day: 'יום שלישי', location: 'אולם בן גוריון', start_time: 17.5, end_time: 19 },
  { slot_number: 57, day: 'יום שלישי', location: 'אולם בן גוריון', start_time: 19, end_time: 20.5 },
  { slot_number: 58, day: 'יום שלישי', location: 'אולם קריית חינוך', start_time: 18, end_time: 19.5 },
  { slot_number: 59, day: 'יום שלישי', location: 'אולם קריית חינוך', start_time: 19.5, end_time: 21 },
  { slot_number: 60, day: 'יום שלישי', location: 'סככת קריית חינוך 1', start_time: 14.5, end_time: 16 },
  { slot_number: 61, day: 'יום שלישי', location: 'סככת קריית חינוך 2', start_time: 14.5, end_time: 16 },
  { slot_number: 62, day: 'יום שלישי', location: 'סככת קריית חינוך 1', start_time: 16, end_time: 17.5 },
  { slot_number: 63, day: 'יום שלישי', location: 'סככת קריית חינוך 2', start_time: 16, end_time: 17.5 },
  { slot_number: 64, day: 'יום שלישי', location: 'סככת קריית חינוך 1', start_time: 17.5, end_time: 19 },
  { slot_number: 65, day: 'יום שלישי', location: 'סככת קריית חינוך 2', start_time: 17.5, end_time: 19 },
  { slot_number: 66, day: 'יום שלישי', location: 'אולם הפועל', start_time: 14.5, end_time: 16 },
  { slot_number: 67, day: 'יום שלישי', location: 'אולם הפועל', start_time: 16, end_time: 17.5 },
  { slot_number: 68, day: 'יום שלישי', location: 'אולם הפועל', start_time: 17.5, end_time: 19 },
  { slot_number: 69, day: 'יום שלישי', location: 'אולם הפועל', start_time: 19, end_time: 20.5 },
  { slot_number: 70, day: 'יום שלישי', location: 'אולם הפועל', start_time: 20.5, end_time: 22 },

  { slot_number: 71, day: 'יום רביעי', location: 'אולם שדות', start_time: 14.5, end_time: 16 },
  { slot_number: 72, day: 'יום רביעי', location: 'אולם שדות', start_time: 16, end_time: 17.5 },
  { slot_number: 73, day: 'יום רביעי', location: 'אולם שדות', start_time: 17.5, end_time: 19 },
  { slot_number: 74, day: 'יום רביעי', location: 'אולם שדות', start_time: 19, end_time: 20.5 },
  { slot_number: 75, day: 'יום רביעי', location: 'חוץ שדות 1', start_time: 18.5, end_time: 20 },
  { slot_number: 76, day: 'יום רביעי', location: 'חוץ שדות 2', start_time: 18.5, end_time: 20 },
  { slot_number: 77, day: 'יום רביעי', location: 'אולם לב המושבה', start_time: 16, end_time: 17.5 },
  { slot_number: 78, day: 'יום רביעי', location: 'אולם לב המושבה', start_time: 17.5, end_time: 19 },
  { slot_number: 79, day: 'יום רביעי', location: 'אולם לב המושבה', start_time: 19, end_time: 20.5 },
  { slot_number: 80, day: 'יום רביעי', location: 'אולם לב המושבה', start_time: 20.5, end_time: 22 },
  { slot_number: 81, day: 'יום רביעי', location: 'חוץ לב המושבה 1', start_time: 16, end_time: 17.5 },
  { slot_number: 82, day: 'יום רביעי', location: 'חוץ לב המושבה 1', start_time: 17.5, end_time: 19 },
  { slot_number: 83, day: 'יום רביעי', location: 'חוץ לב המושבה 1', start_time: 19, end_time: 20.5 },
  { slot_number: 84, day: 'יום רביעי', location: 'אולם הפועל', start_time: 14.5, end_time: 16 },
  { slot_number: 85, day: 'יום רביעי', location: 'אולם הפועל', start_time: 16, end_time: 17.5 },
  { slot_number: 86, day: 'יום רביעי', location: 'אולם הפועל', start_time: 17.5, end_time: 19 },
  { slot_number: 87, day: 'יום רביעי', location: 'אולם הפועל', start_time: 19, end_time: 20.5 },
  { slot_number: 88, day: 'יום רביעי', location: 'אולם הפועל', start_time: 20.5, end_time: 22 },
  { slot_number: 89, day: 'יום רביעי', location: 'סככת קריית חינוך 1', start_time: 14.5, end_time: 16 },
  { slot_number: 90, day: 'יום רביעי', location: 'סככת קריית חינוך 2', start_time: 14.5, end_time: 16 },
  { slot_number: 91, day: 'יום רביעי', location: 'סככת קריית חינוך 1', start_time: 16, end_time: 17.5 },
  { slot_number: 92, day: 'יום רביעי', location: 'סככת קריית חינוך 2', start_time: 16, end_time: 17.5 },
  { slot_number: 93, day: 'יום רביעי', location: 'סככת קריית חינוך 1', start_time: 17.5, end_time: 19 },
  { slot_number: 94, day: 'יום רביעי', location: 'סככת קריית חינוך 2', start_time: 17.5, end_time: 19 },

  { slot_number: 95, day: 'יום חמישי', location: 'אולם שדות', start_time: 14.5, end_time: 16 },
  { slot_number: 96, day: 'יום חמישי', location: 'אולם שדות', start_time: 16, end_time: 17.5 },
  { slot_number: 97, day: 'יום חמישי', location: 'אולם שדות', start_time: 17.5, end_time: 19 },
  { slot_number: 98, day: 'יום חמישי', location: 'אולם שדות', start_time: 19, end_time: 20.5 },
  { slot_number: 99, day: 'יום חמישי', location: 'חוץ שדות 1', start_time: 18.5, end_time: 20 },
  { slot_number: 100, day: 'יום חמישי', location: 'חוץ שדות 2', start_time: 18.5, end_time: 20 },
  { slot_number: 101, day: 'יום חמישי', location: 'אולם לב המושבה', start_time: 20.5, end_time: 22 },
  { slot_number: 102, day: 'יום חמישי', location: 'חוץ לב המושבה 1', start_time: 19, end_time: 20.5 },
  { slot_number: 103, day: 'יום חמישי', location: 'אולם בן גוריון', start_time: 16, end_time: 17.5 },
  { slot_number: 104, day: 'יום חמישי', location: 'אולם בן גוריון', start_time: 17.5, end_time: 19 },
  { slot_number: 105, day: 'יום חמישי', location: 'אולם בן גוריון', start_time: 19, end_time: 20.5 },
  { slot_number: 106, day: 'יום חמישי', location: 'סככת קריית חינוך 1', start_time: 17, end_time: 18.5 },
  { slot_number: 107, day: 'יום חמישי', location: 'סככת קריית חינוך 2', start_time: 17, end_time: 18.5 },
  { slot_number: 108, day: 'יום חמישי', location: 'סככת קריית חינוך 1', start_time: 18.5, end_time: 20 },
  { slot_number: 109, day: 'יום חמישי', location: 'סככת קריית חינוך 2', start_time: 18.5, end_time: 20 },
  { slot_number: 110, day: 'יום חמישי', location: 'חוץ ארגמן', start_time: 18, end_time: 19.5 },
  { slot_number: 111, day: 'יום חמישי', location: 'אולם הפועל', start_time: 14.5, end_time: 16 },
  { slot_number: 112, day: 'יום חמישי', location: 'אולם הפועל', start_time: 16, end_time: 17.5 },
  { slot_number: 113, day: 'יום חמישי', location: 'אולם הפועל', start_time: 17.5, end_time: 19 },
  { slot_number: 114, day: 'יום חמישי', location: 'אולם הפועל', start_time: 19, end_time: 20.5 },
  { slot_number: 115, day: 'יום חמישי', location: 'אולם הפועל', start_time: 20.5, end_time: 22 },

  { slot_number: 116, day: 'יום שישי', location: 'אולם שדות', start_time: 12, end_time: 13.5 },
  { slot_number: 117, day: 'יום שישי', location: 'אולם שדות', start_time: 13.5, end_time: 15 },
  { slot_number: 118, day: 'יום שישי', location: 'אולם שדות', start_time: 15, end_time: 16.5 },
  { slot_number: 119, day: 'יום שישי', location: 'אולם שדות', start_time: 16.5, end_time: 18 },
  { slot_number: 120, day: 'יום שישי', location: 'אולם הפועל', start_time: 12, end_time: 13.5 },
  { slot_number: 121, day: 'יום שישי', location: 'אולם הפועל', start_time: 13.5, end_time: 15 },
  { slot_number: 122, day: 'יום שישי', location: 'אולם הפועל', start_time: 15, end_time: 16.5 },

  { slot_number: 123, day: 'יום שבת', location: 'אולם שדות', start_time: 9, end_time: 10.5 },
  { slot_number: 124, day: 'יום שבת', location: 'אולם שדות', start_time: 10.5, end_time: 12 },
  { slot_number: 125, day: 'יום שבת', location: 'אולם שדות', start_time: 12, end_time: 13.5 },
  { slot_number: 126, day: 'יום שבת', location: 'אולם שדות', start_time: 13.5, end_time: 15 },
  { slot_number: 127, day: 'יום שבת', location: 'אולם שדות', start_time: 15, end_time: 16.5 },
  { slot_number: 128, day: 'יום שבת', location: 'אולם שדות', start_time: 16.5, end_time: 18 },
  { slot_number: 129, day: 'יום שבת', location: 'אולם שדות', start_time: 18, end_time: 19.5 },
  { slot_number: 130, day: 'יום שבת', location: 'אולם שדות', start_time: 19.5, end_time: 21 },
  { slot_number: 131, day: 'יום שבת', location: 'אולם הפועל', start_time: 9, end_time: 10.5 },
  { slot_number: 132, day: 'יום שבת', location: 'אולם הפועל', start_time: 10.5, end_time: 12 },
  { slot_number: 133, day: 'יום שבת', location: 'אולם הפועל', start_time: 12, end_time: 13.5 },
  { slot_number: 134, day: 'יום שבת', location: 'אולם הפועל', start_time: 13.5, end_time: 15 },
  { slot_number: 135, day: 'יום שבת', location: 'אולם הפועל', start_time: 15, end_time: 16.5 },
  { slot_number: 136, day: 'יום שבת', location: 'אולם הפועל', start_time: 16.5, end_time: 18 },
  { slot_number: 137, day: 'יום שבת', location: 'אולם הפועל', start_time: 18, end_time: 19.5 },
  { slot_number: 138, day: 'יום שבת', location: 'אולם הפועל', start_time: 19.5, end_time: 21 },
  { slot_number: 139, day: 'יום שבת', location: 'אולם לב המושבה', start_time: 18.5, end_time: 20 },
  { slot_number: 140, day: 'יום שבת', location: 'אולם לב המושבה', start_time: 20, end_time: 21.5 },
];
/* ===================== MAIN ===================== */

const main = async () => {
  if (!SLOT_DEFINITIONS.length) {
    throw new Error('SLOT_DEFINITIONS is empty');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  const venues = db.collection('venues');
  const slots = db.collection('slots');
  const coaches = db.collection('coaches');
  const teams = db.collection('teams');

  console.log('🧹 FULL RESET...');
  await Promise.all([
    venues.deleteMany({}),
    slots.deleteMany({}),
    coaches.deleteMany({}),
    teams.deleteMany({}),
  ]);

  console.log('🏟️ Creating venues...');
  const venueNames = [...new Set(SLOT_DEFINITIONS.map((s) => s.location))];
  await venues.insertMany(
    venueNames.map((name) => ({
      name,
      isOutdoor: isOutdoorVenue(name),
      created_at: new Date(),
    }))
  );

  console.log('🕒 Creating slots...');
  await slots.insertMany(
    SLOT_DEFINITIONS.map((s) => ({
      ...s,
      isBooked: false,
      assigned_team: '',
      created_at: new Date(),
    }))
  );

  console.log('🧑‍🏫 Creating coaches...');
  const coachByTeam = buildCoachByTeam();
  const coachesData = buildCoaches(coachByTeam);
  await coaches.insertMany(coachesData);

  console.log('🏀 Creating teams...');
  const teamsData = buildTeams(coachByTeam);
  await teams.insertMany(teamsData);

  console.log('📊 Sanity check');
  console.log('Teams:', teamsData.length);
  console.log('Coaches:', coachesData.length);

  await client.close();
  console.log('✅ FULL schedule seed complete.');
};

main().catch((err) => {
  console.error('❌ Failed to seed schedule data:', err);
  process.exit(1);
});