import React, { useState } from 'react';
import Table from './Table';
import { Button, Card } from '@nextui-org/react';
import styles from '../app/styles/Home.module.css';

const VenueSchedule = () => {
    const [selectedHall, setSelectedHall] = useState('');

    const halls = [
        "אולם שדות",
        "אולם הפועל",
        "אולם לב המושבה",
        "חוץ לב המושבה 1",
        "חוץ לב המושבה 2",
        "אולם בן גוריון",
        "אולם קריית חינוך",
        "סככת קריית חינוך 1",
        "סככת קריית חינוך 2",
        "חוץ שדות 1",
        "חוץ שדות 2",
        "חוץ לב המושבה קאנטרי",
        "חוץ ארגמן"
    ];

    return (
        <div className={styles.container}>
          <div>
            {selectedHall === '' ? (
              halls.map((hall, index) => (
                <Card key={index} className={styles.card}>
                  <Button onPress={() => setSelectedHall(hall)}>
                    {hall}
                  </Button>
                </Card>
              ))
            ) : (
              <Table hall={selectedHall} />
            )}
          </div>
      </div>
    );
};

export default VenueSchedule;
