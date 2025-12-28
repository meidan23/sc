import React, { useEffect, useState } from "react";
import { Button } from '@nextui-org/react';

const TeamSchedule = ({ team, setTeamNumber }) => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        if (team) {
            fetch(`/api/teams`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch teams data");
                    }
                    return response.json();
                })
                .then((data) => {
                    const teamData = data.find((t) => String(t.team_number) === String(team));
                    if (teamData) {
                        setSchedule(teamData.scheduled_sessions || []);
                    } else {
                        setError("קבוצה לא נמצאה");
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    setError(error.message);
                    setLoading(false);
                });
        }
    }, [team]);

    if (loading) return <p className="text-center text-blue-500 font-semibold mt-4">טוען לוח זמנים...</p>;
    if (error) return <p className="text-center text-red-500 font-semibold mt-4">שגיאה: {error}</p>;

    return (
        <div dir="rtl" className="max-w-3xl mx-auto p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl mt-4 border border-blue-100">
            <div className="flex justify-between items-center mb-6">
                <Button
                    onClick={() => setTeamNumber('')}
                    className="bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 transition-all duration-300"
                    size="lg"
                >
                    ← חזרה לבחירת קבוצה
                </Button>
                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    לוח זמנים עבור קבוצה {team}
                </h2>
            </div>
            <div className="flex justify-center">
                {schedule.length > 0 ? (
                    <div className="grid gap-4 w-full max-w-2xl">
                        {schedule.map((session, index) => (
                            <div
                                key={index}
                                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-all duration-300"
                            >
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <span className="text-gray-600 block mb-1 text-sm">יום</span>
                                        <span className="font-semibold text-gray-800">{session.day}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 block mb-1 text-sm">שעות</span>
                                        <span className="font-semibold text-gray-800">{session.start_time} - {session.end_time}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 block mb-1 text-sm">מיקום</span>
                                        <span className="font-semibold text-gray-800">{session.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        אין אימונים מתוזמנים עבור הקבוצה
                    </p>
                )}
            </div>
        </div>
    );
};

export default TeamSchedule;
