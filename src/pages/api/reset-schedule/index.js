import { connectToDatabase } from '../middleware/mongo';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const db = await connectToDatabase();
        const teamsCollection = db.collection('teams');
        const slotsCollection = db.collection('slots');

        // התחלת טרנזקציה
        const session = db.client.startSession();

        try {
            await session.withTransaction(async () => {
                // 1. איפוס כל הסלוטים
                await slotsCollection.updateMany(
                    {},
                    { 
                        $set: { isBooked: false },
                        $unset: { assigned_team: "" }
                    },
                    { session }
                );

                // 2. איפוס האימונים המשובצים לכל הקבוצות
                await teamsCollection.updateMany(
                    {},
                    { $set: { scheduled_sessions: [] } },
                    { session }
                );
            });

            res.status(200).json({ message: 'Schedule reset successfully' });
        } finally {
            await session.endSession();
        }
    } catch (error) {
        console.error('Error in reset-schedule:', error);
        res.status(500).json({ message: 'Failed to reset schedule' });
    }
}
