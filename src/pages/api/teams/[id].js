import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../middleware/mongo';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const db = await connectToDatabase();
  const teamsCollection = db.collection('teams');

  const { team_number, desired_sessions, isYoung = false, noOutdoor = false } = req.body;

  if (typeof team_number !== 'number' || Number.isNaN(team_number)) {
    return res.status(400).json({ message: 'team_number must be a number' });
  }

  if (typeof desired_sessions !== 'number' || Number.isNaN(desired_sessions)) {
    return res.status(400).json({ message: 'desired_sessions must be a number' });
  }

  try {
    const existingTeam = await teamsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (existingTeam.team_number !== team_number) {
      const duplicate = await teamsCollection.findOne({ team_number });
      if (duplicate) {
        return res.status(409).json({ message: 'מספר קבוצה זה כבר קיים' });
      }
    }

    await teamsCollection.updateOne(
      { _id: existingTeam._id },
      {
        $set: {
          team_number,
          desired_sessions,
          isYoung: Boolean(isYoung),
          noOutdoor: Boolean(noOutdoor),
        },
      }
    );

    return res.status(200).json({ message: 'Team updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update team', error: error.message });
  }
}
