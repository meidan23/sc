import { connectToDatabase } from '../middleware/mongo';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    const db = await connectToDatabase();
    const collection = db.collection('slots');

    if (req.method === 'GET') {
        try {
            // שליפת כל הסלוטים הפנויים (isBooked: false)
            const availableSlots = await collection.find({ isBooked: false }).toArray();
            res.status(200).json(availableSlots);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch available slots', error: error.message });
        }
    } else if (req.method === 'POST') {
        const { team_number, day, location, start_time, end_time } = req.body;

        if (!team_number || !day || !location || !start_time || !end_time) {
            return res.status(400).json({ message: 'All fields (team_number, day, location, start_time, end_time) are required' });
        }

        try {
            // חיפוש הסלוט המתאים לפי היום, אולם, ושעות
            const slot = await collection.findOne({
                day,
                location,
                start_time,
                end_time,
                isBooked: false
            });

            if (!slot) {
                return res.status(404).json({ message: 'Slot not found or already booked' });
            }

            // עדכון הסלוט עם פרטי הקבוצה
            const result = await collection.updateOne(
                { _id: slot._id },
                { $set: { isBooked: true, assigned_team: team_number } }
            );

            if (result.modifiedCount === 1) {
                res.status(200).json({ message: 'Team assigned to slot successfully' });
            } else {
                res.status(500).json({ message: 'Failed to assign team to slot' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating slot', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
