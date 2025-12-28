import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";

const ScheduleTeam = ({ team, setTeamNumber }) => {
    const [teamsData, setTeamsData] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);

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

    const fetchAvailableSlots = async (teamData) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/slots`);
            if (!response.ok) {
                throw new Error("Failed to fetch available slots");
            }
            const allSlots = await response.json();
            let filteredSlots = allSlots.filter((slot) => !slot.isBooked);
    
            if (teamData.isYoung) {
                filteredSlots = filteredSlots.filter((slot) => slot.start_time <= 19);
            } else {
                filteredSlots = filteredSlots.filter((slot) => slot.start_time >= 16);
            }
    
            if (teamData.noOutdoor) {
                filteredSlots = filteredSlots.filter(
                    (slot) =>
                        !slot.location.includes("חוץ") &&
                        !slot.location.toLowerCase().includes("outdoor") &&
                        !slot.location.toLowerCase().includes("סככת")
                );
            }
    
            teamData.scheduled_sessions.forEach((session) => {
                filteredSlots = filteredSlots.filter(
                    (slot) => slot.day !== session.day
                );
            });
    
            // מיפוי סדר ימות השבוע
            const dayOrder = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    
            // מיון לפי יום, אולם ושעה
            filteredSlots.sort((a, b) => {
                // מיון לפי יום
                const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
                if (dayDiff !== 0) return dayDiff;
    
                // מיון לפי אולם (מיקום)
                const locationDiff = a.location.localeCompare(b.location);
                if (locationDiff !== 0) return locationDiff;
    
                // מיון לפי שעת התחלה
                return a.start_time - b.start_time;
            });
    
            setAvailableSlots(filteredSlots);
            setSelectedTeam(teamData);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };
    

    const assignSlotToTeam = async (slot) => {
        if (!selectedTeam) return;

        try {
            const response = await fetch(`/api/teams`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    team_number: selectedTeam.team_number,
                    day: slot.day,
                    location: slot.location,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                }),
            });

            if (response.ok) {
                setSuccessMessage(`הסלוט שובץ בהצלחה לקבוצה ${selectedTeam.team_number}`);
                setAvailableSlots([]);
                setSelectedTeam(null);
                fetchTeamsData();
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to assign slot to team.");
            }
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) return <p className="text-center text-blue-500 font-semibold mt-4">טוען נתונים...</p>;
    if (error) return <p className="text-center text-red-500 font-semibold mt-4">שגיאה: {error}</p>;

    return (
        <div dir="rtl" className="max-w-3xl mx-auto p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl mt-4 border border-blue-100">
            <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    לוח זמנים עבור קבוצה {team}
                </h2>
                <Button
                    onClick={() => setTeamNumber('')}
                    className="bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 transition-all duration-300"
                    size="lg"
                    dir="ltr"
                >
                    ← חזרה לבחירת קבוצה
                </Button>
            </div>
            
            {teamsData.length > 0 ? (
                teamsData.map((teamData, index) => (
                    <div key={index} className="mb-6">
                        {String(team) === String(teamData.team_number) && (
                            <div>
                                {/* תצוגת אימונים מתוזמנים */}
                                {teamData.scheduled_sessions.length > 0 ? (
                                    <ul className="space-y-4 mb-4">
                                        {teamData.scheduled_sessions.map((session, i) => (
                                            <li
                                                key={i}
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
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        אין אימונים מתוזמנים עבור הקבוצה
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500">לא נמצאו נתונים</p>
            )}
        </div>
    );
};

export default ScheduleTeam;
