"use client";

import React from 'react';
import Link from 'next/link';
import { Button, Card } from '@nextui-org/react';

const creationLinks = [
  { label: 'יצירת קבוצה', href: '/create/team' },
  { label: 'יצירת אולם', href: '/create/venue' },
  { label: 'יצירת סלוט', href: '/create/slot' },
];

export default function CreateHubPage() {
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

      <div className="mx-auto max-w-3xl" dir="rtl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-slate-800">בחירת יצירה</h1>
          <p className="text-slate-600">בחרו את סוג הישות שברצונכם ליצור.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {creationLinks.map((link) => (
            <Card key={link.label} isHoverable className="min-h-[96px]">
              <Button
                as={Link}
                href={link.href}
                className="text-black w-full h-full p-6 text-lg"
                variant="light"
              >
                {link.label}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
