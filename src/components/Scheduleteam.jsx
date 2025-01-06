import React, { useEffect, useState } from "react";

const ScheduleTeam = ({ team }) => {
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
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-4">
            {teamsData.length > 0 ? (
                teamsData.map((teamData, index) => (
                    <div key={index} className="mb-6">
                        {String(team) === String(teamData.team_number) && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    לוח זמנים עבור קבוצה {teamData.team_number}
                                </h2>
                                
                                {/* תצוגת אימונים מתוזמנים */}
                                {teamData.scheduled_sessions.length > 0 ? (
                                    <ul className="space-y-4 mb-4">
                                        {teamData.scheduled_sessions.map((session, i) => (
                                            <li
                                                key={i}
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

                                {/* בדיקת סלוטים פנויים */}
                                {teamData.scheduled_sessions.length >= teamData.desired_sessions ? (
                                    <p>קבוצה {team} השיגה את מספר האימונים הדרושים.</p>
                                ) : (
                                    <div>
                                        <p>
                                            לקבוצה {team} נותרו{" "}
                                            {teamData.desired_sessions - teamData.scheduled_sessions.length} אימונים
                                            לשיבוץ.
                                        </p>
                                        <button
                                            className="bg-blue-500 text-white p-2 rounded mt-2"
                                            onClick={() => fetchAvailableSlots(teamData)}
                                        >
                                            בחר סלוט לשיבוץ
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-center text-red-500">אין קבוצות להצגה.</p>
            )}

            {/* תצוגת סלוטים פנויים */}
            {availableSlots.length > 0 && selectedTeam && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3>סלוטים פנויים לשיבוץ עבור קבוצה {selectedTeam.team_number}</h3>
                    <ul>
                        {availableSlots.map((slot, index) => (
                            <li key={index} className="mb-2">
                                <p>
                                    יום: {slot.day}, שעה: {slot.start_time} - {slot.end_time}, מקום: {slot.location}
                                </p>
                                <button
                                    className="bg-green-500 text-white p-1 rounded"
                                    onClick={() => assignSlotToTeam(slot)}
                                >
                                    בחר סלוט זה
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
        </div>
    );
};

export default ScheduleTeam;
