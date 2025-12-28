"use client";

import React from 'react';
import VenueSchedule from '../../components/VenueSchedule.tsx';
import { Button } from '@nextui-org/react';
import Link from 'next/link';

export default function VenueSchedulePage() {
  return (
    <div className="min-h-screen p-4">
      <Button
        as={Link}
        href="/"
        className="fixed top-4 right-4 z-50 bg-white shadow-lg"
        size="sm"
      >
        חזור לדף הבית
      </Button>
      <VenueSchedule />
    </div>
  );
}
