import { Button, Card, CardBody, CardHeader } from '@nextui-org/react';
import React, { useState } from 'react';
import styles from '../app/styles/Home.module.css';
import ScheduleTeam from './Scheduleteam';
import TeamSchedule from './TeamSchedule';

const ScheduleTeams = ({ viewType }) => {
    const [temp, setTemp] = useState('');
    const [teamNumber, setTeamNumber] = useState(null);

    // יצירת מערך של מספרי קבוצות (1-50 לדוגמה)
    const teamNumbers = Array.from({ length: 50 }, (_, i) => (i + 1).toString());

    const handleSelectionChange = (e) => {
        console.log('Selection changed:', e.target?.value);
        if (e.target?.value) {
            setTemp(e.target.value);
        }
    };

    const handleSelectTeam = () => {
        if (temp) {
            setTeamNumber(temp);
        }
    };

    return (
        <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
            {!teamNumber ? (
                <div className="max-w-md mx-auto mt-16">
                    <Card className="shadow-xl bg-white/90 backdrop-blur-sm border border-blue-100">
                        <CardHeader className="flex flex-col gap-3 p-6 border-b border-blue-100">
                            <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {viewType === 'scheduleTeam' ? 'שיבוץ קבוצה' : 'צפייה בלוח זמנים של קבוצה'}
                            </h1>
                            <p className="text-gray-600 text-center">
                                בחר מספר קבוצה מהרשימה
                            </p>
                        </CardHeader>
                        <CardBody dir='rtl' className="flex flex-col gap-6 p-8 bg-gradient-to-b from-white to-blue-50/50">
                            <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                                <label className="text-lg font-semibold text-gray-700 text-center mb-1">
                                    מספר קבוצה
                                </label>
                                <select
                                    value={temp}
                                    onChange={handleSelectionChange}
                                    className="w-full p-3 text-center text-lg text-gray-800 bg-white/60 border-2 border-blue-200 rounded-xl shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:ring-offset-2 transition-all duration-300"
                                >
                                    <option value="">בחר מספר קבוצה</option>
                                    {teamNumbers.map((num) => (
                                        <option key={num} value={num}>
                                            קבוצה {num}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                onPress={handleSelectTeam}
                                className="mx-auto px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-blue-200 transition-all duration-300"
                                size="lg"
                                isDisabled={!temp}
                            >
                                המשך
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            ) : (
                <div className="w-full">
                    {viewType === 'scheduleTeam' && <ScheduleTeam team={teamNumber} setTeamNumber={setTeamNumber} />}
                    {viewType === 'teamSchedule' && <TeamSchedule team={teamNumber} setTeamNumber={setTeamNumber} />}
                </div>
            )}
        </div>
    );
};

export default ScheduleTeams;
