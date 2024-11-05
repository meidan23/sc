import React from 'react';
import styles from '../app/styles/Table.module.css';
import { Card } from '@nextui-org/react';

const Table = (hall) => {
    const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const hours = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00'];

    return (
        <div>
            <Card className={styles.card}>
                <h1 className='text-black'>{hall.hall}</h1>
            </Card>
            <table dir='rtl' className={styles.table}>
                <thead>
                    <tr>
                        <th dir='rtl'></th>
                        {daysOfWeek.map((day, index) => (
                            <th key={index}>{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {hours.map((hour, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className={styles.hour}>{hour}</td>
                            {daysOfWeek.map((day, colIndex) => (
                                <td key={colIndex}></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
