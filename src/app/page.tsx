"use client";

import React, { useState } from 'react';
import styles from './styles/Home.module.css';
import { Card, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import VenueSchedule from '../components/VenueSchedule';
import ScheduleTeams from '../components/ScheduleTeams';

const Views = {
  HOME: 'home',
  TEAM_SCHEDULE: 'teamSchedule',
  VENUE_SCHEDULE: 'venueSchedule',
  SCHEDULE_TEAM: 'scheduleTeam',
};

const BUTTONS = [
  { label: 'הצג לו״ז קבוצה', view: Views.TEAM_SCHEDULE },
  { label: 'הצג לו״ז אולם', view: Views.VENUE_SCHEDULE },
  { label: 'שבץ קבוצה', view: Views.SCHEDULE_TEAM },
  { label: 'אפס שיבוץ', action: 'reset' },
  { label: 'שיבוץ אוטומטי חכם', link: '/scheduler' },
];

export default function Home() {
  const [activeView, setActiveView] = useState(Views.HOME);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false); // מודל לאיפוס
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // מודל הצלחה
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // טיפול באיפוס השיבוץ
  const handleReset = async () => {
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset slots and teams');
      }

      const data = await response.json();
      setMessage(data.message);
      setIsResetModalOpen(false); // סגור את מודל האיפוס
      setIsSuccessModalOpen(true); // פתח מודל הצלחה
    } catch (error: any) {
      setError(error.message);
    }
  };

  // סגירת המודל
  const closeResetModal = () => {
    setIsResetModalOpen(false);
    setMessage(null);
    setError(null);
  };

  // תצוגת הבית
  const renderHomeView = () => (
    <div>
      {BUTTONS.map((button) => (
        <Card key={button.label} className={styles.card}>
          <Button
            className="text-black"
            onPress={() => {
              console.log('Button pressed:', button.label);
              if (button.link) {
                window.location.href = button.link;
              } else if (button.action === 'reset') {
                console.log('Opening reset modal');
                setIsResetModalOpen(true); // פתח את מודל האיפוס
              } else {
                setActiveView(button.view!);
              }
            }}
          >
            {button.label}
          </Button>
        </Card>
      ))}

{/* מודל איפוס */}
{isResetModalOpen && (
  <Modal
  isOpen={isResetModalOpen}
  onClose={closeResetModal}
  dir="rtl"
  className="fixed flex items-center justify-center z-[9999]"
  placement="center"
  hideCloseButton
>
  <ModalContent className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
    <ModalHeader className="text-lg font-bold text-center border-b pb-2">⚠️ אישור איפוס</ModalHeader>
    <ModalBody className="text-center py-4">
      <p className="text-gray-600">האם אתה בטוח שברצונך לאפס את כל השיבוץ?</p>
    </ModalBody>
    <ModalFooter className="flex justify-center gap-4 border-t pt-2">
      <Button onPress={closeResetModal} color="default" variant="light" className="w-24 border border-red-500">
        לא
      </Button>
      <Button onPress={handleReset} color="danger" variant="solid" className="w-24 border border-green-500">
        כן
      </Button>
    </ModalFooter>
    </ModalContent>
  </Modal>
)}

{/* מודל הצלחה */}
{isSuccessModalOpen && (
  <Modal
    isOpen={isSuccessModalOpen}
    onClose={() => setIsSuccessModalOpen(false)}
    dir="rtl"
    className="fixed flex items-center justify-center z-[9999]"
    placement="center"
    hideCloseButton
  >
    <ModalContent className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
      <ModalHeader className="text-lg font-bold text-center border-b pb-2">🎉 איפוס בוצע בהצלחה</ModalHeader>
      <ModalBody className="text-center py-4">
        <p className="text-gray-600">כל הסלוטים והקבוצות אופסו בהצלחה!</p>
      </ModalBody>
      <ModalFooter className="flex justify-center gap-4 border-t pt-2">
        <Button onPress={() => setIsSuccessModalOpen(false)} color="success" variant="solid" className="w-24 border">
          סגור
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
)}
    </div>
  );

  // תצוגת תתי עמודים
  const renderSubView = (component: React.ReactNode) => (
    <div className={styles.componentContainer}>
      <button
        className={styles.globalReturnButton}
        onClick={() => setActiveView(Views.HOME)}
      >
        חזור
      </button>
      {component}
    </div>
  );

  // מנהל תצוגות
  const renderView = () => {
    const viewComponents = {
      [Views.TEAM_SCHEDULE]: <ScheduleTeams viewType="teamSchedule" />,
      [Views.VENUE_SCHEDULE]: <VenueSchedule />,
      [Views.SCHEDULE_TEAM]: <ScheduleTeams viewType="scheduleTeam" />,
    };

    return activeView === Views.HOME
      ? renderHomeView()
      : renderSubView(viewComponents[activeView]);
  };

  return <div className={styles.container}>{renderView()}</div>;
}
