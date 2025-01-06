"use client";

import React, { useState } from 'react';
import styles from './styles/Home.module.css';
import { Card, Button } from '@nextui-org/react';
import VenueSchedule from '../components/VenueSchedule';
import ScheduleTeams from '../components/ScheduleTeams';
import Reset from '../components/Reset';

export default function Home() {
  const [teamSchedule, setTeamSchedule] = useState(false);
  const [venueSchedule, setVenueSchedule] = useState(false);
  const [scheduleTeam, setIsSchduleTeam] = useState(false);
  const [reset, setIsReset] = useState(false);

  return (
    <div className={styles.container}>
      {!venueSchedule && !scheduleTeam && !reset && !teamSchedule && (
        <div>
          <Card className={styles.card}>
            <Button className="text-black" onPress={() => setTeamSchedule(true)}>
              הצג לו״ז קבוצה
            </Button>
          </Card>
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
          <Card className={styles.card}>
            <Button className="text-black" onPress={() => setIsReset(true)}>
              אפס שיבוץ
            </Button>
          </Card>
          <Card className={styles.card}>
            <Button className="text-black" onPress={() => window.location.href = '/scheduler'}>
              שיבוץ אוטומטי חכם
            </Button>
          </Card>
        </div>
      )}
      {teamSchedule &&
      <div>
        <ScheduleTeams viewType="teamSchedule" />
        <Card className={styles.card}>
          <Button className="text-black" onPress={() => setTeamSchedule(false)}>
            חזור
          </Button>
        </Card>
      </div>
      }
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
        <ScheduleTeams viewType="scheduleTeam" />
        <Card className={styles.card}>
          <Button className="text-black" onPress={() => setIsSchduleTeam(false)}>
            חזור
          </Button>
        </Card>
      </div>
      }
      {reset &&
      <div>
        <Reset />
        <Card className={styles.card}>
          <Button className="text-black" onPress={() => setIsReset(false)}>
            חזור
          </Button>
        </Card>
      </div>
      }
    </div>
  );
}
