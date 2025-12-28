import { API_ROUTES } from '../constants';
import type { Team, Slot } from '../types';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }
  return response.json();
}

export const api = {
  async resetSchedule(): Promise<{ success: boolean }> {
    const response = await fetch(API_ROUTES.RESET, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  async getTeams(): Promise<Team[]> {
    const response = await fetch(API_ROUTES.TEAMS);
    return handleResponse(response);
  },

  async getSlots(): Promise<Slot[]> {
    const response = await fetch(API_ROUTES.SLOTS);
    return handleResponse(response);
  },

  async assignTeam(slotId: string, teamId: string): Promise<Slot> {
    const response = await fetch(`${API_ROUTES.SLOTS}/${slotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    });
    return handleResponse(response);
  },
};
