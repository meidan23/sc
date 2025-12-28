"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@nextui-org/react';

export default function CreateTeamPage() {
  const [teamNumber, setTeamNumber] = useState('');
  const [desiredSessions, setDesiredSessions] = useState('3');
  const [isYoung, setIsYoung] = useState(false);
  const [noOutdoor, setNoOutdoor] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_number: Number(teamNumber),
          desired_sessions: Number(desiredSessions),
          isYoung,
          noOutdoor,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'שגיאה ביצירת הקבוצה');
      }

      setStatus('✅ הקבוצה נוצרה בהצלחה');
      setTeamNumber('');
      setDesiredSessions('3');
      setIsYoung(false);
      setNoOutdoor(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'שגיאה לא ידועה');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <Button
        as={Link}
        href="/"
        className="fixed top-4 right-4 z-50 bg-white shadow-lg"
        size="sm"
      >
        חזור לדף הבית
      </Button>

      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-lg" dir="rtl">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">יצירת קבוצה</h1>
        <p className="mb-6 text-slate-600">הזינו את פרטי הקבוצה לשמירה במסד.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">מספר קבוצה</label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-200 p-2"
              value={teamNumber}
              onChange={(event) => setTeamNumber(event.target.value)}
              min="1"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">מספר אימונים רצוי בשבוע</label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-200 p-2"
              value={desiredSessions}
              onChange={(event) => setDesiredSessions(event.target.value)}
              min="0"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isYoung}
              onChange={(event) => setIsYoung(event.target.checked)}
            />
            קבוצה צעירה
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={noOutdoor}
              onChange={(event) => setNoOutdoor(event.target.checked)}
            />
            ללא אימוני חוץ
          </label>

          <Button type="submit" color="primary" isLoading={isSubmitting} className="w-full">
            שמור קבוצה
          </Button>
        </form>

        {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}
      </div>
    </div>
  );
}
