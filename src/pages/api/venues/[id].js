import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../middleware/mongo';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const db = await connectToDatabase();
  const venuesCollection = db.collection('venues');

  const { name, isOutdoor = false, notes = '' } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }

  try {
    const existingVenue = await venuesCollection.findOne({ _id: new ObjectId(id) });
    if (!existingVenue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    if (existingVenue.name !== name) {
      const duplicate = await venuesCollection.findOne({ name });
      if (duplicate) {
        return res.status(409).json({ message: 'שם אולם זה כבר קיים' });
      }
    }

    await venuesCollection.updateOne(
      { _id: existingVenue._id },
      {
        $set: {
          name,
          isOutdoor: Boolean(isOutdoor),
          notes,
        },
      }
    );

    return res.status(200).json({ message: 'Venue updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update venue', error: error.message });
  }
}
