import { connectToDatabase } from '../middleware/mongo';

export default async function handler(req, res) {
    const db = await connectToDatabase();
    const slotsCollection = db.collection('slots');
    const teamsCollection = db.collection('teams');

    if (req.method === 'POST') {
        try {
            // איפוס כל הסלוטים - הגדרת isBooked ל-false ו-assigned_team לריק
            await slotsCollection.updateMany({}, { $set: { isBooked: false, assigned_team: "" } });

            // איפוס כל הקבוצות - הגדרת scheduled_sessions לריק
            await teamsCollection.updateMany({}, { $set: { scheduled_sessions: [] } });

            res.status(200).json({ message: 'All slots and teams reset successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to reset slots and teams', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
