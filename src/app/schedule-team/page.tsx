"use client";

import React from 'react';
import ScheduleTeams from '../../components/ScheduleTeams';
import { Button } from '@nextui-org/react';
import Link from 'next/link';

export default function ScheduleTeamPage() {
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
      <ScheduleTeams viewType="scheduleTeam" />
    </div>
  );
}
