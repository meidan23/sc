"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@nextui-org/react";
import styles from "../styles/Home.module.css";

export default function Scheduler() {
    const [teamsData, setTeamsData] = useState([]);
    const [proposedSchedules, setProposedSchedules] = useState([]);
    const [log, setLog] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    

    // Fetch teams data
    const fetchTeamsData = async () => {
        try {
            const response = await fetch(`/api/teams`);
            if (!response.ok) throw new Error("Failed to fetch teams");
            const data = await response.json();
            setTeamsData(data);
        } catch (error) {
            console.error("Error fetching teams:", error);
        }
    };

    // Fetch available slots
    const fetchAvailableSlots = async () => {
        try {
            const response = await fetch(`/api/slots`);
            if (!response.ok) throw new Error("Failed to fetch slots");
            const allSlots = await response.json();
            return allSlots.filter((slot) => !slot.isBooked);
        } catch (error) {
            console.error("Error fetching slots:", error);
            return [];
        }
    };

    const startScheduler = async () => {
        setLoading(true);
        setLog([]);
        setProposedSchedules([]);
        setSuccessMessage(null);
    
        setLog((prev) => [...prev, "מתחילים תהליך שיבוץ..."]);
    
        try {
            const allSlots = await fetchAvailableSlots();
            if (!allSlots.length) {
                setLog((prev) => [...prev, "אין סלוטים פנויים לשיבוץ."]);
                setLoading(false);
                return;
            }

            const assignedDays = {};
            const assignedSlotIds = new Set();
            let hasSchedules = false; // משתנה לבדיקת הצלחת השיבוץ

            const getSlotId = (slot) =>
                slot._id ?? `${slot.day}-${slot.start_time}-${slot.location}`;
    
            for (const team of teamsData) {
                let filteredSlots = [...allSlots].filter(
                    (slot) => !assignedSlotIds.has(getSlotId(slot))
                );
    
                setLog((prev) => [...prev, `בודק אפשרויות שיבוץ עבור קבוצה ${team.team_number}...`]);
    
                // Apply slot filtering rules
                if (team.isYoung) {
                    filteredSlots = filteredSlots.filter((slot) => slot.start_time <= 19);
                } else {
                    filteredSlots = filteredSlots.filter((slot) => slot.start_time >= 16);
                }
    
                if (team.noOutdoor) {
                    filteredSlots = filteredSlots.filter(
                        (slot) =>
                            !slot.location.includes("חוץ") &&
                            !slot.location.toLowerCase().includes("outdoor") &&
                            !slot.location.toLowerCase().includes("סככת")
                    );
                }
    
                team.scheduled_sessions.forEach((session) => {
                    filteredSlots = filteredSlots.filter(
                        (slot) => slot.day !== session.day
                    );
                });
    
                // Prevent multiple sessions for the same team on the same day
                filteredSlots = filteredSlots.filter((slot) => {
                    if (!assignedDays[team.team_number]) {
                        assignedDays[team.team_number] = new Set();
                    }
                    return !assignedDays[team.team_number].has(slot.day);
                });
    
                let scheduledSessions = 0;
                const teamSchedules = [];
    
                while (
                    scheduledSessions < team.desired_sessions &&
                    filteredSlots.length > 0
                ) {
                    const randomIndex = Math.floor(Math.random() * filteredSlots.length);
                    const selectedSlot = filteredSlots[randomIndex];
    
                    teamSchedules.push({
                        team_number: team.team_number,
                        day: selectedSlot.day,
                        location: selectedSlot.location,
                        start_time: selectedSlot.start_time,
                        end_time: selectedSlot.end_time,
                    });

                    // Mark the day as assigned for this team
                    assignedDays[team.team_number].add(selectedSlot.day);
                    assignedSlotIds.add(getSlotId(selectedSlot));

                    // Remove the slot from the pool
                    filteredSlots.splice(randomIndex, 1);
                    scheduledSessions++;
                }
    
                if (teamSchedules.length > 0) {
                    hasSchedules = true;
                }
    
                setProposedSchedules((prev) => [...prev, ...teamSchedules]);
                setLog((prev) => [...prev, `שובצו ${teamSchedules.length} אימונים לקבוצה ${team.team_number}`]);
            }
    
            if (!hasSchedules) {
                setLog((prev) => [...prev, "לא נמצאו שיבוצים מתאימים."]);
            } else {
                setLog((prev) => [...prev, "תהליך השיבוץ הסתיים בהצלחה."]);
            }
        } catch (error) {
            setLog((prev) => [...prev, `שגיאה בתהליך השיבוץ: ${error.message}`]);
        } finally {
            setLoading(false);
        }
    };
    

    const approveSchedule = async (schedule) => {
        try {
            const response = await fetch(`/api/teams`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(schedule),
            });
    
            if (response.ok) {
                setLog((prev) => [
                    ...prev,
                    `שיבוץ אושר לקבוצה ${schedule.team_number} ביום ${schedule.day} בשעה ${schedule.start_time}`,
                ]);
                setProposedSchedules((prev) =>
                    prev.filter((s) => s !== schedule)
                );
            } else {
                setLog((prev) => [
                    ...prev,
                    `שגיאה באישור השיבוץ לקבוצה ${schedule.team_number}.`,
                ]);
            }
        } catch (error) {
            setLog((prev) => [
                ...prev,
                `שגיאה בתהליך אישור השיבוץ: ${error.message}`,
            ]);
        }
    };    

    const rejectSchedule = (schedule) => {
        setLog((prev) => [
            ...prev,
            `שיבוץ נדחה לקבוצה ${schedule.team_number} ביום ${schedule.day} בשעה ${schedule.start_time}`,
        ]);
        setProposedSchedules((prev) =>
            prev.filter((s) => s !== schedule)
        );
    };

    useEffect(() => {
        fetchTeamsData();
    }, []);

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <Button onPress={startScheduler} disabled={loading}>
                    {loading ? "מבצע שיבוץ..." : "התחל שיבוץ"}
                </Button>
            </Card>

            <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3>יומן השיבוץ:</h3>
                <ul>
                    {log.map((entry, index) => (
                        <li key={index}>{entry}</li>
                    ))}
                </ul>
            </div>

            {proposedSchedules.length > 0 && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3>שיבוצים מוצעים:</h3>
                    <ul>
                        {proposedSchedules.map((schedule, index) => (
                            <li key={index}>
                                <p>
                                    קבוצה {schedule.team_number}, יום {schedule.day}, שעה{" "}
                                    {schedule.start_time} - {schedule.end_time}, מקום:{" "}
                                    {schedule.location}
                                </p>
                                <Button
                                    className="bg-green-500 text-white p-2 m-1"
                                    onClick={() => approveSchedule(schedule)}
                                >
                                    אשר
                                </Button>
                                <Button
                                    className="bg-red-500 text-white p-2 m-1"
                                    onClick={() => rejectSchedule(schedule)}
                                >
                                    דחה
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {successMessage && <p className="text-green-500">{successMessage}</p>}
        </div>
    );
}
