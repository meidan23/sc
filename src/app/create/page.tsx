"use client";

import React from 'react';
import Link from 'next/link';
import { Button, Card } from '@nextui-org/react';

const editLinks = [
  { label: 'עריכת קבוצות', href: '/edit/teams' },
  { label: 'עריכת אולמות', href: '/edit/venues' },
  { label: 'עריכת סלוטים', href: '/edit/slots' },
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

      <div className="mx-auto max-w-4xl" dir="rtl">
        <div className="grid gap-4 md:grid-cols-3">
          {editLinks.map((link) => (
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
