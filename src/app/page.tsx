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

  const handleReset = async () => {
    setMessage(null);
    setError(null);
    setIsResetModalOpen(false); // סגור מודל אישור

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
      setIsSuccessModalOpen(true); // פתח מודל הצלחה
    } catch (error: any) {
      setError(error.message);
    }
  };

  const renderHomeView = () => (
    <div>
      {BUTTONS.map((button) => (
        <Card key={button.label} className={styles.card}>
          <Button
            className="text-black"
            onClick={() => {
              if (button.link) {
                window.location.href = button.link;
              } else if (button.action === 'reset') {
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
      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
        <ModalContent>
          <ModalHeader>אישור איפוס</ModalHeader>
          <ModalBody>
            <p>האם אתה בטוח שברצונך לאפס את כל השיבוץ?</p>
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setIsResetModalOpen(false)}>לא</Button>
            <Button className="text-white bg-red-500" onPress={handleReset}>כן</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* מודל הצלחה */}
      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)}>
        <ModalContent>
          <ModalHeader>איפוס בוצע בהצלחה</ModalHeader>
          <ModalBody>
            <p>כל הסלוטים והקבוצות אופסו בהצלחה!</p>
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setIsSuccessModalOpen(false)}>סגור</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );

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
