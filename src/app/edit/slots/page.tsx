"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@nextui-org/react';

type Slot = {
  _id: string;
  day: string;
  location: string;
  start_time: number;
  end_time: number;
  isBooked?: boolean;
  assigned_team?: string | number;
};

export default function EditSlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadSlots = async () => {
      try {
        const response = await fetch('/api/slots');
        if (!response.ok) throw new Error('שגיאה בטעינת הסלוטים');
        const data = await response.json();
        const sortedSlots = [...data].sort((a: Slot, b: Slot) => {
          if (a.day !== b.day) {
            return a.day.localeCompare(b.day, 'he');
          }
          return Number(a.start_time) - Number(b.start_time);
        });
        setSlots(sortedSlots);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'שגיאה לא ידועה');
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, []);

  const updateSlotField = (id: string, field: keyof Slot, value: string | number | boolean) => {
    setSlots((prev) => prev.map((slot) => (slot._id === id ? { ...slot, [field]: value } : slot)));
  };

  const handleSave = async (slot: Slot) => {
    setStatus(null);
    try {
      const response = await fetch(`/api/slots/${slot._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: slot.day,
          location: slot.location,
          start_time: Number(slot.start_time),
          end_time: Number(slot.end_time),
          isBooked: Boolean(slot.isBooked),
          assigned_team: slot.assigned_team ?? '',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'שגיאה בעדכון הסלוט');
      }

      setStatus('✅ הסלוט עודכן בהצלחה');
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

      <div className="mx-auto max-w-5xl" dir="rtl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-slate-800">עריכת סלוטים</h1>
          <p className="text-slate-600">ערכו את זמני האימונים והשיוך לקבוצות.</p>
        </div>

        <Button
          as={Link}
          href="/create/slot"
          color="primary"
          className="mb-6"
        >
          הוספת סלוט
        </Button>

        {status && <p className="mb-4 text-sm text-slate-700">{status}</p>}

        {loading ? (
          <p className="text-slate-600">טוען סלוטים...</p>
        ) : (
          <div className="grid gap-4">
            {slots.map((slot) => (
              <Card key={slot._id} className="p-4" isHoverable>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">יום</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 p-2"
                      value={slot.day}
                      onChange={(event) => updateSlotField(slot._id, 'day', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">אולם</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 p-2"
                      value={slot.location}
                      onChange={(event) =>
                        updateSlotField(slot._id, 'location', event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">שעת התחלה</label>
                    <input
                      type="number"
                      step="0.5"
                      className="w-full rounded-lg border border-slate-200 p-2"
                      value={slot.start_time}
                      onChange={(event) =>
                        updateSlotField(slot._id, 'start_time', Number(event.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">שעת סיום</label>
                    <input
                      type="number"
                      step="0.5"
                      className="w-full rounded-lg border border-slate-200 p-2"
                      value={slot.end_time}
                      onChange={(event) =>
                        updateSlotField(slot._id, 'end_time', Number(event.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(slot.isBooked)}
                      onChange={(event) =>
                        updateSlotField(slot._id, 'isBooked', event.target.checked)
                      }
                    />
                    סלוט תפוס
                  </label>
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">קבוצה משובצת</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 p-2"
                      value={slot.assigned_team ?? ''}
                      onChange={(event) =>
                        updateSlotField(slot._id, 'assigned_team', event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button color="primary" onPress={() => handleSave(slot)}>
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
