import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../middleware/mongo';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const db = await connectToDatabase();
  const slotsCollection = db.collection('slots');

  const {
    day,
    location,
    start_time,
    end_time,
    isBooked = false,
    assigned_team = '',
  } = req.body;

  if (!day || !location || typeof start_time !== 'number' || typeof end_time !== 'number') {
    return res.status(400).json({ message: 'day, location, start_time, end_time are required' });
  }

  try {
    const existingSlot = await slotsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingSlot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    await slotsCollection.updateOne(
      { _id: existingSlot._id },
      {
        $set: {
          day,
          location,
          start_time,
          end_time,
          isBooked: Boolean(isBooked),
          assigned_team,
        },
      }
    );

    return res.status(200).json({ message: 'Slot updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update slot', error: error.message });
  }
}
