"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@nextui-org/react';

type Team = {
  _id: string;
  team_number: number;
  desired_sessions: number;
  isYoung?: boolean;
  noOutdoor?: boolean;
};

export default function EditTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        if (!response.ok) throw new Error('שגיאה בטעינת הקבוצות');
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'שגיאה לא ידועה');
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  const updateTeamField = (id: string, field: keyof Team, value: number | boolean) => {
    setTeams((prev) =>
      prev.map((team) => (team._id === id ? { ...team, [field]: value } : team))
    );
  };

  const handleSave = async (team: Team) => {
    setStatus(null);
    try {
      const response = await fetch(`/api/teams/${team._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_number: team.team_number,
          desired_sessions: team.desired_sessions,
          isYoung: Boolean(team.isYoung),
          noOutdoor: Boolean(team.noOutdoor),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'שגיאה בעדכון הקבוצה');
      }

      setStatus(`✅ קבוצה ${team.team_number} עודכנה בהצלחה`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'שגיאה לא ידועה');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <Button
        as={Link}
        href="/create"
        className="fixed top-4 right-4 z-50 bg-white shadow-lg"
        size="sm"
      >
        חזור לניהול נתונים
      </Button>

      <div className="mx-auto max-w-4xl" dir="rtl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-slate-800">עריכת קבוצות</h1>
          <p className="text-slate-600">ערכו את פרטי הקבוצות הקיימות במסד.</p>
        </div>

        {status && <p className="mb-4 text-sm text-slate-700">{status}</p>}

        {loading ? (
          <p className="text-slate-600">טוען קבוצות...</p>
        ) : (
          <div className="grid gap-4">
            {teams.map((team) => (
              <Card key={team._id} className="p-4" isHoverable>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">מספר קבוצה</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-200 p-2"
                      value={team.team_number}
                      onChange={(event) =>
                        updateTeamField(team._id, 'team_number', Number(event.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">מספר אימונים רצוי</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-200 p-2"
                      value={team.desired_sessions}
                      onChange={(event) =>
                        updateTeamField(team._id, 'desired_sessions', Number(event.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-700">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(team.isYoung)}
                      onChange={(event) => updateTeamField(team._id, 'isYoung', event.target.checked)}
                    />
                    קבוצה צעירה
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(team.noOutdoor)}
                      onChange={(event) =>
                        updateTeamField(team._id, 'noOutdoor', event.target.checked)
                      }
                    />
                    ללא אימוני חוץ
                  </label>
                </div>

                <div className="mt-4">
                  <Button color="primary" onPress={() => handleSave(team)}>
                    שמור שינויים
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
