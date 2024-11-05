"use client";

import React, { useState } from 'react';
import styles from './styles/Home.module.css';
import { Card, Button } from '@nextui-org/react';
import VenueSchedule from '../components/VenueSchedule';
import ScheduleTeam from '../components/ScheduleTeams';

export default function Home() {
  const [venueSchedule, setVenueSchedule] = useState(false);
  const [scheduleTeam, setIsSchduleTeam] = useState(false);

  return (
    <div className={styles.container}>
      {!venueSchedule && !scheduleTeam && (
        <div>
        <Card className={styles.card}>
          <Button className="text-black" onPress={() => setVenueSchedule(true)}>
            הצג לו״ז אולם
          </Button>
        </Card>
        <Card className={styles.card}>
          <Button className="text-black" onPress={() => setIsSchduleTeam(true)}>
            שבץ קבוצה
          </Button>
        </Card>
        </div>
      )}
      {venueSchedule &&
      <div>
        <VenueSchedule /> 
        <Card className={styles.card}>
          <Button className="text-black" onPress={() => setVenueSchedule(false)}>
            חזור
          </Button>
        </Card>
      </div>
      }
      {scheduleTeam &&
      <div>
        <ScheduleTeam />
        <Card className={styles.card}>
          <Button className="text-black" onPress={() => setIsSchduleTeam(false)}>
            חזור
          </Button>
        </Card>
      </div>
      }
    </div>
  );
}
