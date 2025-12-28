import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { Team, Slot } from '../types';

export function useSchedule() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const loadTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getTeams();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת הקבוצות');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSlots = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getSlots();
      setSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת המשבצות');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetSchedule = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/reset-schedule', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('נכשל באיפוס השיבוצים');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה באיפוס השיבוץ');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    teams,
    slots,
    isLoading,
    error,
    loadTeams,
    loadSlots,
    resetSchedule,
  };
}
