import React, { useEffect, useState } from "react";

const ScheduleTeam = ({ team }) => {
    const [teamsData, setTeamsData] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null); // Store the team for which slots are being displayed

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
                setAvailableSlots([]); // Clear the slots after assignment
                setSelectedTeam(null); // Clear the selected team
                fetchTeamsData(); // Refresh the data
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to assign slot to team.");
            }
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) return <p className="text-black">טוען נתונים...</p>;
    if (error) return <p className="text-black">שגיאה: {error}</p>;

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
                <p>אין קבוצות להצגה</p>
            )}

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
            {availableSlots.length === 0 && selectedTeam && (
                <p className="mt-4">אין סלוטים פנויים לשיבוץ עבור קבוצה {selectedTeam.team_number}</p>
            )}

            {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
        </div>
    );
};

export default ScheduleTeam;
