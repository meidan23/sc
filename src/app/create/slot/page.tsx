"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@nextui-org/react';

export default function CreateSlotPage() {
  const [day, setDay] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/slots/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day,
          location,
          start_time: Number(startTime),
          end_time: Number(endTime),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'שגיאה ביצירת הסלוט');
      }

      setStatus('✅ הסלוט נוצר בהצלחה');
      setDay('');
      setLocation('');
      setStartTime('');
      setEndTime('');
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
        <h1 className="mb-2 text-2xl font-bold text-slate-800">יצירת סלוט</h1>
        <p className="mb-6 text-slate-600">הגדירו סלוט זמין לשיבוץ.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">יום</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 p-2"
              value={day}
              onChange={(event) => setDay(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">אולם</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 p-2"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">שעת התחלה</label>
              <input
                type="number"
                step="0.5"
                className="w-full rounded-lg border border-slate-200 p-2"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">שעת סיום</label>
              <input
                type="number"
                step="0.5"
                className="w-full rounded-lg border border-slate-200 p-2"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" color="primary" isLoading={isSubmitting} className="w-full">
            שמור סלוט
          </Button>
        </form>

        {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}
      </div>
    </div>
  );
}
