import { Button, Card, Input } from '@nextui-org/react';
import React, { useState } from 'react';
import styles from '../app/styles/Home.module.css';
import ScheduleTeam from './Scheduleteam';
import TeamSchedule from './TeamSchedule'; // Ensure you have this component imported if it exists

const ScheduleTeams = ({ viewType }) => { // שינוי ל-viewType
    const [temp, setTemp] = useState('');
    const [teamNumber, setTeamNumber] = useState(null);

    const handleInputChange = (event) => {
        setTemp(event.target.value);
    };

    const handleSelectTeam = () => {
        setTeamNumber(temp);
    };

    return (
        <div dir="rtl" className={styles.container}>
            {!teamNumber && (
                <Card className={styles.card}>
                    <p>בחר מספר קבוצה</p>
                    <Input 
                        type="number"
                        placeholder="הזן מספר קבוצה"
                        value={temp}
                        onChange={handleInputChange}
                        className={styles.input}
                    />
                    <Button 
                        onPress={handleSelectTeam}
                        className="text-white bg-blue-500 rounded p-2" 
                        style={{ marginTop: '10px' }}
                    >
                        בחר
                    </Button>
                </Card>
            )}
            {viewType === 'scheduleTeam' && teamNumber && <ScheduleTeam team={teamNumber} />}
            {viewType === 'teamSchedule' && teamNumber && <TeamSchedule team={teamNumber} />}
        </div>
    );
};

export default ScheduleTeams;
