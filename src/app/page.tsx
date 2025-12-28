"use client";

import React, { useState, useCallback } from 'react';
import styles from './styles/Home.module.css';
import { Card, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { useSchedule } from '../hooks/useSchedule';
import Link from 'next/link';

export default function Home() {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const { resetSchedule, isLoading, error } = useSchedule();

  const handleReset = useCallback(async () => {
    try {
      await resetSchedule();
      setIsResetModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'שגיאה לא ידועה');
    }
  }, [resetSchedule]);

  const closeResetModal = useCallback(() => {
    setIsResetModalOpen(false);
  }, []);

  const buttons = [
    { label: 'הצג לו״ז קבוצה', href: '/team-schedule' },
    { label: 'הצג לו״ז אולם', href: '/venue-schedule' },
    { label: 'שבץ קבוצה', href: '/schedule-team' },
    { label: 'שיבוץ אוטומטי חכם', href: '/auto-schedule' },
    { label: 'שיבוץ גרידי', href: '/greedy-schedule' },
    { label: 'עריכה', href: '/create' },
    { label: 'אפס שיבוץ', action: 'reset' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>מערכת ניהול אולמות</h1>
        <p>ברוכים הבאים למערכת ניהול האולמות. בחרו באפשרות הרצויה:</p>
      </div>
      
      <div className={styles.buttonContainer}>
        {buttons.map((button) => (
          <Card 
            key={button.label} 
            className={styles.card}
            isHoverable
          >
            {button.action === 'reset' ? (
              <Button
                className="text-black w-full h-full p-6 text-lg"
                onPress={() => setIsResetModalOpen(true)}
                isLoading={isLoading}
                variant="light"
              >
                {button.label}
              </Button>
            ) : (
              <Button
                as={Link}
                href={button.href}
                className="text-black w-full h-full p-6 text-lg"
                variant="light"
              >
                {button.label}
              </Button>
            )}
          </Card>
        ))}
      </div>

      <footer className={styles.footer}>
        <p> 2025 מערכת ניהול אולמות</p>
      </footer>

      <Modal 
        isOpen={isResetModalOpen} 
        onClose={closeResetModal}
        placement="center"
        backdrop="blur"
        classNames={{
          base: "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 opacity-50",
          wrapper: "z-[1000]"
        }}
      >
        <ModalContent>
          <div className="bg-white p-6 rounded-lg max-w-md w-full text-center" dir="rtl">
            <ModalHeader className="flex justify-center">
              <h3 className="text-xl font-bold">⚠️ אישור איפוס</h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600 mb-4">
                האם אתה בטוח שברצונך לאפס את כל השיבוצים? פעולה זו תמחק את כל האימונים המשובצים.
              </p>
              {error && (
                <p className="text-red-500 mb-4">{error}</p>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-center gap-4">
              <Button
                color="danger"
                variant="light"
                onPress={handleReset}
                isLoading={isLoading}
                className="min-w-[120px]"
              >
                כן, אפס הכל
              </Button>
              <Button 
                color="primary"
                variant="flat"
                onPress={closeResetModal}
                isDisabled={isLoading}
                className="min-w-[120px]"
              >
                ביטול
              </Button>
            </ModalFooter>
          </div>
        </ModalContent>
      </Modal>

      <Modal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)}
        placement="center"
        backdrop="blur"
        classNames={{
          base: "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 opacity-50",
          wrapper: "z-[1000]"
        }}
      >
        <ModalContent>
          <div className="bg-white p-6 rounded-lg max-w-md w-full text-center" dir="rtl">
            <ModalHeader className="flex justify-center">
              <h3 className="text-xl font-bold">✅ הפעולה הושלמה</h3>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600">
                כל השיבוצים אופסו בהצלחה
              </p>
            </ModalBody>
            <ModalFooter className="flex justify-center">
              <Button 
                color="primary"
                variant="flat"
                onPress={() => setIsSuccessModalOpen(false)}
                className="min-w-[120px]"
              >
                סגור
              </Button>
            </ModalFooter>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
