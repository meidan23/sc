import { connectToDatabase } from '../middleware/mongo';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const db = await connectToDatabase();
  const slotsCollection = db.collection('slots');

  const { day, location, start_time, end_time } = req.body;

  if (!day || !location || typeof start_time !== 'number' || typeof end_time !== 'number') {
    return res.status(400).json({ message: 'day, location, start_time, end_time are required' });
  }

  try {
    const existing = await slotsCollection.findOne({ day, location, start_time, end_time });
    if (existing) {
      return res.status(409).json({ message: 'סלוט זה כבר קיים' });
    }

    const result = await slotsCollection.insertOne({
      day,
      location,
      start_time,
      end_time,
      isBooked: false,
      assigned_team: '',
      created_at: new Date(),
    });

    return res.status(201).json({ message: 'Slot created', id: result.insertedId });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create slot', error: error.message });
  }
}
