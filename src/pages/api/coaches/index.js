import { connectToDatabase } from '../middleware/mongo';

export default async function handler(req, res) {
  const db = await connectToDatabase();
  const coachesCollection = db.collection('coaches');

  if (req.method === 'GET') {
    try {
      const coaches = await coachesCollection.find({}).toArray();
      return res.status(200).json(coaches);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch coaches', error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { name, phone = '', notes = '' } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    try {
      const existing = await coachesCollection.findOne({ name });
      if (existing) {
        return res.status(409).json({ message: 'מאמן עם שם זה כבר קיים' });
      }

      const result = await coachesCollection.insertOne({
        name,
        phone,
        notes,
        created_at: new Date(),
      });

      return res.status(201).json({ message: 'Coach created', id: result.insertedId });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create coach', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
