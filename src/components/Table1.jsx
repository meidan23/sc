import React, { useEffect, useState } from 'react';
import styles from '../app/styles/Table.module.css';
import { Card } from '@nextui-org/react';

const Table1 = ({ hall }) => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRanges, setTimeRanges] = useState([]);

    const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const response = await fetch('/api/slots');
                if (!response.ok) throw new Error('Failed to fetch slots');
                const data = await response.json();

                const hallSlots = data.filter(slot => slot.location === hall);
                setSlots(hallSlots);

                const timeRangesSet = new Set();
                hallSlots.forEach(slot => {
                    const startHour = convertToTimeString(slot.start_time);
                    const endHour = convertToTimeString(slot.end_time);
                    timeRangesSet.add(`${startHour}-${endHour}`);
                });
                setTimeRanges(Array.from(timeRangesSet).sort());

                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };
        fetchSlots();
    }, [hall]);

    const convertToTimeString = (time) => {
        const hours = Math.floor(time);
        const minutes = (time - hours) * 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const findSlot = (day, timeRange) => {
        const [start, end] = timeRange.split('-').map(convertTimeStringToDecimal);
        return slots.find(slot => {
            const slotDay = getHebrewDay(slot.day);
            return slotDay === day && slot.start_time === start && slot.end_time === end;
        });
    };

    const getHebrewDay = (day) => {
        const daysMap = {
            Sunday: 'ראשון',
            Monday: 'שני',
            Tuesday: 'שלישי',
            Wednesday: 'רביעי',
            Thursday: 'חמישי',
            Friday: 'שישי',
            Saturday: 'שבת'
        };
        return daysMap[day] || day;
    };

    const convertTimeStringToDecimal = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours + minutes / 60;
    };

    if (loading) return <p className="text-black">טוען נתונים...</p>;
    if (error) return <p className="text-black">שגיאה בטעינת הסלוטים: {error}</p>;

    return (
        <div>
            <Card className={styles.card}>
                <h1 className="text-black">{hall}</h1>
            </Card>
            <table dir="rtl" className={styles.table}>
                <thead>
                    <tr>
                        <th></th>
                        {daysOfWeek.map((day, index) => (
                            <th key={index}>{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {timeRanges.map((timeRange, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className={styles.hour}>{timeRange}</td>
                            {daysOfWeek.map((day, colIndex) => {
                                const slot = findSlot(day, timeRange);
                                const isBooked = slot?.isBooked || slot?.assigned_team; // בדיקת תפוסות הסלוט
                                
                                return (
                                    <td
                                        key={colIndex}
                                        className={
                                            isBooked
                                                ? styles.booked // צבע אדום לתפוס
                                                : slot
                                                ? styles.available // צבע אחר לפנוי
                                                : styles.unavailable // צבע "לא זמין" לשעות שלא מופיעות
                                        }
                                    >
                                        {isBooked ? (
                                            <span>קבוצה {slot.assigned_team}</span>
                                        ) : slot ? (
                                            <span>פנוי</span>
                                        ) : (
                                            <span>לא זמין</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table1;
