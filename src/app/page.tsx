"use client";

import React, { useState } from 'react';
import styles from './styles/Home.module.css';
import { Card, Button } from '@nextui-org/react';
import VenueSchedule from '../components/VenueSchedule';
import ScheduleTeams from '../components/ScheduleTeams';
import Reset from '../components/Reset';

const Views = {
  HOME: 'home',
  TEAM_SCHEDULE: 'teamSchedule',
  VENUE_SCHEDULE: 'venueSchedule',
  SCHEDULE_TEAM: 'scheduleTeam',
  RESET: 'reset',
};

const BUTTONS = [
  { label: 'הצג לו״ז קבוצה', view: Views.TEAM_SCHEDULE },
  { label: 'הצג לו״ז אולם', view: Views.VENUE_SCHEDULE },
  { label: 'שבץ קבוצה', view: Views.SCHEDULE_TEAM },
  { label: 'אפס שיבוץ', view: Views.RESET },
  { label: 'שיבוץ אוטומטי חכם', link: '/scheduler' },
];

export default function Home() {
  const [activeView, setActiveView] = useState(Views.HOME);

  const renderHomeView = () => (
    <div>
      {BUTTONS.map((button) => (
        <Card key={button.label} className={styles.card}> 
          <Button
            className="text-black"
            onPress={() =>
              button.link
                ? (window.location.href = button.link)
                : setActiveView(button.view!)
            }
          >
            {button.label}
          </Button>
        </Card>
      ))}
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
      [Views.RESET]: <Reset />,
    };

    return activeView === Views.HOME
      ? renderHomeView()
      : renderSubView(viewComponents[activeView]);
  };

  return <div className={styles.container}>{renderView()}</div>;
}
