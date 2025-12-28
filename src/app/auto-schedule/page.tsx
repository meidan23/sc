"use client";

import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Spinner, Progress, Modal, ModalContent, ModalBody } from '@nextui-org/react';
import Link from 'next/link';

interface Team {
  team_number: string;
  desired_sessions: number;
  scheduled_sessions: any[];
}

interface Slot {
  day: string;
  start_time: string;
  end_time: string;
  location: string;
  isBooked?: boolean;
}

export default function AutoSchedulePage() {
  const [isScheduling, setIsScheduling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const startAutoSchedule = async () => {
    setIsScheduling(true);
    setStatus('מתחיל תהליך שיבוץ...');
    setProgress(0);
    setError('');
    setSuccess(false);

    try {
      // 1. קבלת כל הקבוצות
      setStatus('אוסף נתונים על קבוצות...');
      setProgress(20);
      const teamsResponse = await fetch('/api/teams');
      if (!teamsResponse.ok) throw new Error('נכשל בטעינת נתוני הקבוצות');
      const teams: Team[] = await teamsResponse.json();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. קבלת כל הסלוטים הפנויים
      setStatus('בודק זמינות אולמות...');
      setProgress(40);
      const slotsResponse = await fetch('/api/slots');
      if (!slotsResponse.ok) throw new Error('נכשל בטעינת נתוני הסלוטים');
      const slots: Slot[] = await slotsResponse.json();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. אלגוריתם שיבוץ חכם
      setStatus('מחשב אילוצים ומבצע שיבוץ אופטימלי...');
      setProgress(60);

      // מיון הקבוצות לפי מספר האימונים הדרוש (יורד)
      const sortedTeams = [...teams].sort((a, b) => 
        (b.desired_sessions - b.scheduled_sessions.length) - 
        (a.desired_sessions - a.scheduled_sessions.length)
      );

      // מיון הסלוטים הפנויים
      const availableSlots = slots.filter(slot => !slot.isBooked);

      // שיבוץ לכל קבוצה
      for (const team of sortedTeams) {
        const neededSessions = team.desired_sessions - team.scheduled_sessions.length;
        if (neededSessions <= 0) continue;

        // בחירת סלוטים מתאימים לקבוצה
        const teamSlots = availableSlots
          .filter(slot => !slot.isBooked)
          .slice(0, neededSessions);

        if (teamSlots.length > 0) {
          // שיבוץ הסלוטים לקבוצה
          const assignments = teamSlots.map(slot => ({
            team_number: team.team_number,
            ...slot
          }));

          // עדכון הסלוטים כתפוסים
          const assignResponse = await fetch('/api/assign-slots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignments })
          });

          if (!assignResponse.ok) {
            throw new Error('נכשל בשיבוץ הקבוצות');
          }

          // סימון הסלוטים כתפוסים
          assignments.forEach(assignment => {
            const slotIndex = availableSlots.findIndex(s => 
              s.day === assignment.day && 
              s.start_time === assignment.start_time && 
              s.location === assignment.location
            );
            if (slotIndex !== -1) {
              availableSlots[slotIndex].isBooked = true;
            }
          });
        }
      }

      setStatus('השיבוץ הושלם בהצלחה!');
      setProgress(100);
      setSuccess(true);

    } catch (error) {
      console.error('Error in auto scheduling:', error);
      setError(error instanceof Error ? error.message : 'אירעה שגיאה בתהליך השיבוץ');
      setStatus('נכשל');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <Button
        as={Link}
        href="/"
        className="fixed top-4 left-4 z-50 bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 transition-all duration-300"
        size="lg"
      >
        ← חזור לדף הבית
      </Button>
      
      <div className="max-w-3xl mx-auto mt-16">
        <Card className="shadow-xl bg-white/90 backdrop-blur-sm border border-blue-100">
          <CardHeader className="flex flex-col gap-3 p-6 border-b border-blue-100">
            <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              שיבוץ אוטומטי חכם
            </h1>
            <p className="text-gray-600 text-center">
              המערכת תשבץ את כל הקבוצות באופן אוטומטי תוך התחשבות באילוצים ומקסום יעילות השימוש באולמות
            </p>
          </CardHeader>

          <CardBody className="flex flex-col gap-6 p-8">
            {!isScheduling ? (
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">לפני שמתחילים:</h3>
                  <ul className="space-y-2 text-blue-700">
                    <li>• וודא שכל הקבוצות הזינו את הדרישות שלהן</li>
                    <li>• וודא שכל האולמות מעודכנים במערכת</li>
                    <li>• התהליך עשוי לקחת מספר דקות</li>
                  </ul>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg shadow-lg hover:shadow-blue-200 transition-all duration-300"
                  size="lg"
                  onPress={startAutoSchedule}
                >
                  התחל שיבוץ אוטומטי
                </Button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-center">
                    השיבוץ הושלם בהצלחה!
                  </div>
                )}
              </div>
            ) : (
              <Modal 
                isOpen={isScheduling} 
                hideCloseButton
                isDismissable={false}
                placement="center"
                backdrop="blur"
                classNames={{
                  base: "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                  backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 opacity-50",
                  wrapper: "z-[1000]"
                }}
              >
                <ModalContent>
                  <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border border-blue-100">
                    <ModalBody className="flex flex-col items-center gap-6">
                      <Spinner size="lg" color="primary" />
                      <div className="space-y-4">
                        <p className="text-lg font-medium text-gray-700">{status}</p>
                        <Progress
                          aria-label="התקדמות השיבוץ"
                          value={progress}
                          className="max-w-md"
                          classNames={{
                            indicator: "bg-gradient-to-r from-blue-600 to-indigo-600",
                            track: "bg-blue-100"
                          }}
                        />
                        <p className="text-sm text-gray-500">
                          אנא המתן בסבלנות, התהליך עשוי לקחת מספר דקות
                        </p>
                      </div>
                    </ModalBody>
                  </div>
                </ModalContent>
              </Modal>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
