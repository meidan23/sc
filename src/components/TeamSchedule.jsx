import React, { useEffect, useState } from "react";

const TeamSchedule = ({ team }) => {
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
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                לוח זמנים עבור קבוצה {team}
            </h2>
            {schedule.length > 0 ? (
                <ul className="space-y-4">
                    {schedule.map((session, index) => (
                        <li
                            key={index}
                            className="p-4 bg-gray-100 rounded-lg shadow-sm border border-gray-200"
                        >
                            <p><strong>יום:</strong> {session.day}</p>
                            <p><strong>שעה:</strong> {session.start_time} - {session.end_time}</p>
                            <p><strong>מיקום:</strong> {session.location}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-red-500">אין אימונים מתוזמנים עבור הקבוצה.</p>
            )}
        </div>
    );
};

export default TeamSchedule;
