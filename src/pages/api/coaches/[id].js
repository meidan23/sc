import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../middleware/mongo';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const db = await connectToDatabase();
  const coachesCollection = db.collection('coaches');

  const { name, phone = '', notes = '' } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }

  try {
    const existingCoach = await coachesCollection.findOne({ _id: new ObjectId(id) });
    if (!existingCoach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    if (existingCoach.name !== name) {
      const duplicate = await coachesCollection.findOne({ name });
      if (duplicate) {
        return res.status(409).json({ message: 'שם מאמן זה כבר קיים' });
      }
    }

    await coachesCollection.updateOne(
      { _id: existingCoach._id },
      {
        $set: {
          name,
          phone,
          notes,
        },
      }
    );

    return res.status(200).json({ message: 'Coach updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update coach', error: error.message });
  }
}
