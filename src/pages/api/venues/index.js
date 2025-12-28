import { connectToDatabase } from '../middleware/mongo';

export default async function handler(req, res) {
  const db = await connectToDatabase();
  const venuesCollection = db.collection('venues');

  if (req.method === 'GET') {
    try {
      const venues = await venuesCollection.find({}).toArray();
      return res.status(200).json(venues);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch venues', error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { name, isOutdoor = false, notes = '' } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    try {
      const existing = await venuesCollection.findOne({ name });
      if (existing) {
        return res.status(409).json({ message: 'אולם עם שם זה כבר קיים' });
      }

      const result = await venuesCollection.insertOne({
        name,
        isOutdoor: Boolean(isOutdoor),
        notes,
        created_at: new Date(),
      });

      return res.status(201).json({ message: 'Venue created', id: result.insertedId });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create venue', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
