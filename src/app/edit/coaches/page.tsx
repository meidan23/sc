"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@nextui-org/react';

type Coach = {
  _id: string;
  name: string;
  phone?: string;
  notes?: string;
};

export default function EditCoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadCoaches = async () => {
      try {
        const response = await fetch('/api/coaches');
        if (!response.ok) throw new Error('שגיאה בטעינת המאמנים');
        const data = await response.json();
        setCoaches(data);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'שגיאה לא ידועה');
      } finally {
        setLoading(false);
      }
    };

    loadCoaches();
  }, []);

  const updateCoachField = (id: string, field: keyof Coach, value: string) => {
    setCoaches((prev) =>
      prev.map((coach) => (coach._id === id ? { ...coach, [field]: value } : coach))
    );
  };

  const handleSave = async (coach: Coach) => {
    setStatus(null);
    try {
      const response = await fetch(`/api/coaches/${coach._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: coach.name,
          phone: coach.phone || '',
          notes: coach.notes || '',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'שגיאה בעדכון המאמן');
      }

      setStatus(`✅ המאמן ${coach.name} עודכן בהצלחה`);
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
          <h1 className="mb-2 text-2xl font-bold text-slate-800">עריכת מאמנים</h1>
          <p className="text-slate-600">עדכנו את פרטי המאמנים במסד הנתונים.</p>
        </div>

        <Button as={Link} href="/create/coach" color="primary" className="mb-6">
          הוספת מאמן
        </Button>

        {status && <p className="mb-4 text-sm text-slate-700">{status}</p>}

        {loading ? (
          <p className="text-slate-600">טוען מאמנים...</p>
        ) : (
          <div className="grid gap-4">
            {coaches.map((coach) => (
              <Card key={coach._id} className="p-4" isHoverable>
                <div>
                  <label className="mb-1 block text-sm text-slate-700">שם מאמן</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 p-2"
                    value={coach.name}
                    onChange={(event) => updateCoachField(coach._id, 'name', event.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-sm text-slate-700">טלפון</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 p-2"
                    value={coach.phone || ''}
                    onChange={(event) =>
                      updateCoachField(coach._id, 'phone', event.target.value)
                    }
                  />
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-sm text-slate-700">הערות</label>
                  <textarea
                    className="w-full rounded-lg border border-slate-200 p-2"
                    value={coach.notes || ''}
                    onChange={(event) =>
                      updateCoachField(coach._id, 'notes', event.target.value)
                    }
                    rows={3}
                  />
                </div>

                <div className="mt-4">
                  <Button color="primary" onPress={() => handleSave(coach)}>
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
