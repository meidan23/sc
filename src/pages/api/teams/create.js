import { connectToDatabase } from '../middleware/mongo';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const db = await connectToDatabase();
  const teamsCollection = db.collection('teams');

  const { team_number, desired_sessions, isYoung = false, noOutdoor = false } = req.body;

  if (typeof team_number !== 'number' || Number.isNaN(team_number)) {
    return res.status(400).json({ message: 'team_number is required and must be a number' });
  }

  if (typeof desired_sessions !== 'number' || Number.isNaN(desired_sessions)) {
    return res.status(400).json({ message: 'desired_sessions is required and must be a number' });
  }

  try {
    const existing = await teamsCollection.findOne({ team_number });
    if (existing) {
      return res.status(409).json({ message: 'קבוצה עם מספר זה כבר קיימת' });
    }

    const result = await teamsCollection.insertOne({
      team_number,
      desired_sessions,
      scheduled_sessions: [],
      isYoung: Boolean(isYoung),
      noOutdoor: Boolean(noOutdoor),
      created_at: new Date(),
    });

    return res.status(201).json({ message: 'Team created', id: result.insertedId });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create team', error: error.message });
  }
}
