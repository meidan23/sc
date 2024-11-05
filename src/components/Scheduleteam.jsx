import React, { useEffect, useState } from "react";

const ScheduleTeam = ({ team }) => {
    const [teamsData, setTeamsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`/api/teams`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setTeamsData(data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <p className="text-black">טוען נתונים...</p>;
    if (error) return <p className="text-black">שגיאה בטעינת נתוני הקבוצות: {error}</p>;

    return (
        <div className="text-black">
            {teamsData.length > 0 ? (
                teamsData.map((teamData, index) => (
                    <div key={index}>
                        {String(team) == teamData.team_number &&
                        <div>
                        {teamData.scheduled_sessions.length >= teamData.desired_sessions ? (
                            <p>קבוצה {team} השיגה את מספר האימונים הדרושים.</p>
                        ) : (
                            <p>לקבוצה {team} נותרו {teamData.desired_sessions - teamData.scheduled_sessions.length} אימונים לשיבוץ.</p>
                        )}
                        </div>
                        }
                    </div>
                ))
            ) : (
                <p>אין קבוצות להצגה</p>
            )}
        </div>
    );
};

export default ScheduleTeam;
