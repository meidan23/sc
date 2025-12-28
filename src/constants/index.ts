export type ViewType = 'home' | 'teamSchedule' | 'venueSchedule' | 'scheduleTeam';

export const Views: Record<string, ViewType> = {
  HOME: 'home',
  TEAM_SCHEDULE: 'teamSchedule',
  VENUE_SCHEDULE: 'venueSchedule',
  SCHEDULE_TEAM: 'scheduleTeam',
} as const;

interface BaseButton {
  label: string;
}

interface ViewButton extends BaseButton {
  view: ViewType;
}

interface ActionButton extends BaseButton {
  action: 'reset';
}

interface LinkButton extends BaseButton {
  link: string;
}

export type ButtonType = ViewButton | ActionButton | LinkButton;

export const BUTTONS: ButtonType[] = [
  { label: 'הצג לו״ז קבוצה', view: Views.TEAM_SCHEDULE },
  { label: 'הצג לו״ז אולם', view: Views.VENUE_SCHEDULE },
  { label: 'שבץ קבוצה', view: Views.SCHEDULE_TEAM },
  { label: 'אפס שיבוץ', action: 'reset' },
  { label: 'שיבוץ אוטומטי חכם', link: '/scheduler' },
] as const;

export const API_ROUTES = {
  RESET: '/api/reset',
  SLOTS: '/api/slots',
  TEAMS: '/api/teams',
} as const;
