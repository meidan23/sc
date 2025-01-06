import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import styles from '../app/styles/Table.module.css';

const Table = ({ hall }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const response = await fetch('/api/slots');
                if (!response.ok) throw new Error('Failed to fetch slots');
                const data = await response.json();

                const hallSlots = data.filter(slot => slot.location === hall);

                const formattedEvents = hallSlots.map(slot => {
                    const isBooked = slot.isBooked;

                    return {
                        title: isBooked ? `קבוצה ${slot.assigned_team}` : 'פנוי',
                        start: convertToISODate(slot.day, slot.start_time),
                        end: convertToISODate(slot.day, slot.end_time),
                        backgroundColor: isBooked ? '#ffcccc' : '#ccffcc',
                        borderColor: isBooked ? '#cc0000' : '#00cc00',
                        textColor: '#000000', // טקסט בצבע שחור
                    };
                });

                setEvents(formattedEvents);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchSlots();
    }, [hall]);

    const convertToISODate = (day, time) => {
        const dayNumber = getDayNumber(day);
        const date = `2024-11-${String(dayNumber).padStart(2, '0')}`;
        const timeString = convertToTimeString(time);
        return `${date}T${timeString}:00`;
    };

    const convertToTimeString = (time) => {
        const hours = Math.floor(time);
        const minutes = (time - hours) * 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const getDayNumber = (day) => {
        const daysMap = {
            ראשון: 10,
            שני: 11,
            שלישי: 12,
            רביעי: 13,
            חמישי: 14,
            שישי: 15,
            שבת: 16,
        };
        return daysMap[day] || 0;
    };

    if (loading) return <p className="text-black">טוען נתונים...</p>;
    if (error) return <p className="text-black">שגיאה בטעינת הסלוטים: {error}</p>;

    return (
        <div>
            <h1 className="text-black">{hall}</h1>
            <div className={styles.googleTable} style={{ display: 'flex', color: '#000' }}>
                {/* FullCalendar */}
                <div style={{ flex: 1 }}>
                    <FullCalendar
                        direction='rtl'
                        plugins={[timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        locale="he"
                        events={events}
                        allDaySlot={false}
                        slotMinTime="08:00:00"
                        slotMaxTime="22:00:00"
                        height="auto"
                        nowIndicator={true}
                        firstDay={0}
                        dayHeaderFormat={{ weekday: 'long' }}
                        eventTextColor="#000000" // טקסט שחור באירועים
                        headerToolbar={{
                            start: '', // הסתרת תפריט ניווט
                            center: '',
                            end: '',
                        }}
                        contentHeight="auto"
                    />
                </div>
            </div>
        </div>
    );
};

export default Table;
