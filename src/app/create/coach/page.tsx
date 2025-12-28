"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@nextui-org/react';

export default function CreateCoachPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/coaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'שגיאה ביצירת המאמן');
      }

      setStatus('✅ המאמן נוצר בהצלחה');
      setName('');
      setPhone('');
      setNotes('');
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
        <h1 className="mb-2 text-2xl font-bold text-slate-800">יצירת מאמן</h1>
        <p className="mb-6 text-slate-600">הזינו את פרטי המאמן לשמירה במסד.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">שם מאמן</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 p-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">טלפון</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 p-2"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">הערות</label>
            <textarea
              className="w-full rounded-lg border border-slate-200 p-2"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" color="primary" isLoading={isSubmitting} className="w-full">
            שמור מאמן
          </Button>
        </form>

        {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}
      </div>
    </div>
  );
}
