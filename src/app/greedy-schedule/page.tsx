"use client";

import React, { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Spinner, Progress, Modal, ModalContent, ModalBody } from '@nextui-org/react';
import Link from 'next/link';
import { runGreedySchedule } from '../../services/greedyScheduler';

export default function GreedySchedulePage() {
  const [isScheduling, setIsScheduling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const startGreedySchedule = async () => {
    setIsScheduling(true);
    setStatus('מתחיל תהליך שיבוץ גרידי...');
    setProgress(0);
    setError('');
    setSuccess(false);

    try {
      await runGreedySchedule({
        onProgress: ({ status, progress }: { status: string; progress: number }) => {
          setStatus(status);
          setProgress(progress);
        },
      });
      setSuccess(true);
    } catch (error) {
      console.error('Error in greedy scheduling:', error);
      setError(error instanceof Error ? error.message : 'אירעה שגיאה בתהליך השיבוץ הגרידי');
      setStatus('נכשל');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen p-4 bg-gradient-to-br from-amber-50 to-orange-50">
      <Button
        as={Link}
        href="/"
        className="fixed top-4 left-4 z-50 bg-white text-amber-700 border-2 border-amber-200 hover:bg-amber-50 transition-all duration-300"
        size="lg"
      >
        ← חזור לדף הבית
      </Button>
      
      <div className="max-w-3xl mx-auto mt-16">
        <Card className="shadow-xl bg-white/90 backdrop-blur-sm border border-amber-100">
          <CardHeader className="flex flex-col gap-3 p-6 border-b border-amber-100">
            <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              שיבוץ גרידי
            </h1>
            <p className="text-gray-600 text-center">
              האלגוריתם הגרידי משבץ קבוצות לפי סדר עדיפויות פשוט ומהיר תוך כיבוד האילוצים הבסיסיים
            </p>
          </CardHeader>

          <CardBody className="flex flex-col gap-6 p-8">
            {!isScheduling ? (
              <div className="space-y-6">
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                  <h3 className="text-lg font-semibold text-amber-800 mb-3">מה חשוב לדעת:</h3>
                  <ul className="space-y-2 text-amber-700">
                    <li>• האלגוריתם ממלא סלוטים לפי זמינות פשוטה</li>
                    <li>• הוא מנסה למקסם כמה שיותר אימונים בפחות זמן</li>
                    <li>• הקבוצות משובצות לכל היותר פעם אחת בכל יום</li>
                  </ul>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white text-lg shadow-lg hover:shadow-amber-200 transition-all duration-300"
                  size="lg"
                  onPress={startGreedySchedule}
                >
                  התחל שיבוץ גרידי
                </Button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-center">
                    השיבוץ הגרידי הושלם בהצלחה!
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
                  <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border border-amber-100">
                    <ModalBody className="flex flex-col items-center gap-6">
                      <Spinner size="lg" color="warning" />
                      <div className="space-y-4">
                        <p className="text-lg font-medium text-gray-700">{status}</p>
                        <Progress
                          aria-label="התקדמות השיבוץ"
                          value={progress}
                          className="max-w-md"
                          classNames={{
                            indicator: "bg-gradient-to-r from-amber-600 to-orange-600",
                            track: "bg-amber-100"
                          }}
                        />
                        <p className="text-sm text-gray-500">
                          אנא המתן בסבלנות, התהליך עשוי לקחת מספר רגעים
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
