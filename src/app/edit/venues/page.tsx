"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@nextui-org/react';

type Venue = {
  _id: string;
  name: string;
  isOutdoor?: boolean;
  notes?: string;
};

export default function EditVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const response = await fetch('/api/venues');
        if (!response.ok) throw new Error('שגיאה בטעינת האולמות');
        const data = await response.json();
        setVenues(data);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'שגיאה לא ידועה');
      } finally {
        setLoading(false);
      }
    };

    loadVenues();
  }, []);

  const updateVenueField = (id: string, field: keyof Venue, value: string | boolean) => {
    setVenues((prev) =>
      prev.map((venue) => (venue._id === id ? { ...venue, [field]: value } : venue))
    );
  };

  const handleSave = async (venue: Venue) => {
    setStatus(null);
    try {
      const response = await fetch(`/api/venues/${venue._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: venue.name,
          isOutdoor: Boolean(venue.isOutdoor),
          notes: venue.notes || '',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'שגיאה בעדכון האולם');
      }

      setStatus(`✅ האולם ${venue.name} עודכן בהצלחה`);
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
          <h1 className="mb-2 text-2xl font-bold text-slate-800">עריכת אולמות</h1>
          <p className="text-slate-600">עדכנו את פרטי האולמות במסד הנתונים.</p>
        </div>

        {status && <p className="mb-4 text-sm text-slate-700">{status}</p>}

        {loading ? (
          <p className="text-slate-600">טוען אולמות...</p>
        ) : (
          <div className="grid gap-4">
            {venues.map((venue) => (
              <Card key={venue._id} className="p-4" isHoverable>
                <div>
                  <label className="mb-1 block text-sm text-slate-700">שם אולם</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 p-2"
                    value={venue.name}
                    onChange={(event) => updateVenueField(venue._id, 'name', event.target.value)}
                  />
                </div>

                <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(venue.isOutdoor)}
                    onChange={(event) =>
                      updateVenueField(venue._id, 'isOutdoor', event.target.checked)
                    }
                  />
                  אולם חוץ
                </label>

                <div className="mt-4">
                  <label className="mb-1 block text-sm text-slate-700">הערות</label>
                  <textarea
                    className="w-full rounded-lg border border-slate-200 p-2"
                    value={venue.notes || ''}
                    onChange={(event) => updateVenueField(venue._id, 'notes', event.target.value)}
                    rows={3}
                  />
                </div>

                <div className="mt-4">
                  <Button color="primary" onPress={() => handleSave(venue)}>
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
