import { Card } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import styles from "../app/styles/Home.module.css";

const ScheduleTeam = ({ team }) => {
    const [teamsData, setTeamsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Fetching team data function
    const fetchTeamsData = () => {
        setLoading(true);
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
    };

    useEffect(() => {
        fetchTeamsData();
    }, []);

    const scheduleAdditionalSessions = async (teamData) => {
        try {
            const response = await fetch(`/api/slots`);
            if (!response.ok) {
                throw new Error("Failed to fetch available slots");
            }
            const availableSlots = await response.json();

            const sessionsNeeded = teamData.desired_sessions - teamData.scheduled_sessions.length;
            let sessionsScheduled = 0;
            for (const slot of availableSlots) {
                if (sessionsScheduled >= sessionsNeeded) break;

                const res = await fetch(`/api/teams`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        team_number: teamData.team_number,
                        day: slot.day,
                        location: slot.location,
                        start_time: slot.start_time,
                        end_time: slot.end_time,
                    }),
                });

                if (res.ok) {
                    sessionsScheduled++;
                }
            }

            setSuccessMessage(`שובצו ${sessionsScheduled} אימונים לקבוצה ${teamData.team_number}`);
            fetchTeamsData(); // Refresh the data after scheduling
        } catch (error) {
            console.error("Error scheduling additional sessions:", error);
        }
    };

    if (loading) return <p className="text-black">טוען נתונים...</p>;
    if (error) return <p className="text-black">שגיאה בטעינת נתוני הקבוצות: {error}</p>;

    return (
        <div className="text-black">
            {teamsData.length > 0 ? (
                teamsData.map((teamData, index) => (
                    <div key={index} className="mb-6">
                        {String(team) === String(teamData.team_number) && (
                            <div>
                                {teamData.scheduled_sessions.length >= teamData.desired_sessions ? (
                                    <p>קבוצה {team} השיגה את מספר האימונים הדרושים.</p>
                                ) : (
                                    <div>
                                        <p>לקבוצה {team} נותרו {teamData.desired_sessions - teamData.scheduled_sessions.length} אימונים לשיבוץ.</p>
                                        <button 
                                            className="bg-blue-500 text-white p-2 rounded mt-2" 
                                            onClick={() => scheduleAdditionalSessions(teamData)}
                                        >
                                            שיבוץ אוטומטי
                                        </button>
                                        {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p>אין קבוצות להצגה</p>
            )}
        </div>
    );
};

export default ScheduleTeam;
