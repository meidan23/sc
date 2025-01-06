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

    if (loading) return <p className="text-black">טוען לוח זמנים...</p>;
    if (error) return <p className="text-black">שגיאה: {error}</p>;

    return (
        <div className="text-black">
            <h2>לוח זמנים עבור קבוצה {team}</h2>
            {schedule.length > 0 ? (
                <ul>
                    {schedule.map((session, index) => (
                        <li key={index}>
                            יום: {session.day}, שעה: {session.end_time} - {session.start_time}, מיקום: {session.location}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>אין אימונים מתוזמנים עבור הקבוצה.</p>
            )}
        </div>
    );
};

export default TeamSchedule;
