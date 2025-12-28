import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

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

    if (loading) return <p>טוען נתונים...</p>;
    if (error) return <p>שגיאה בטעינת הסלוטים: {error}</p>;

    return (
        <div>
            <Typography variant="h4" gutterBottom style={{ color: '#000000' }}>{hall}</Typography>
            <TableContainer component={Paper}>
                <Table dir="rtl">
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            {daysOfWeek.map((day, index) => (
                                <TableCell key={index}>{day}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {timeRanges.map((timeRange, rowIndex) => (
                            <TableRow key={rowIndex}>
                                <TableCell>{timeRange}</TableCell>
                                {daysOfWeek.map((day, colIndex) => {
                                    const slot = findSlot(day, timeRange);
                                    const isBooked = slot?.isBooked || slot?.assigned_team;
                                    return (
                                        <TableCell key={colIndex} style={{
                                            backgroundColor: isBooked ? '#f44336' : slot ? '#00c903' : '#d3d3d3',
                                            color: isBooked || slot ? 'white' : '#777',
                                            textAlign: 'center'
                                        }}>
                                            {isBooked ? `קבוצה ${slot.assigned_team}` : slot ? 'פנוי' : 'לא זמין'}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Table1;
