import { connectToDatabase } from '../middleware/mongo';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const db = await connectToDatabase();
        const teamsCollection = db.collection('teams');
        const slotsCollection = db.collection('slots');

        const { assignments } = req.body;

        if (!Array.isArray(assignments)) {
            return res.status(400).json({ message: 'Invalid assignments format' });
        }

        // עדכון כל השיבוצים בטרנזקציה אחת
        const session = db.client.startSession();

        try {
            await session.withTransaction(async () => {
                for (const assignment of assignments) {
                    const { team_number, day, start_time, end_time, location } = assignment;

                    // 1. עדכון הסלוט כתפוס
                    await slotsCollection.updateOne(
                        { 
                            day,
                            start_time,
                            end_time,
                            location,
                            isBooked: { $ne: true }
                        },
                        {
                            $set: { 
                                isBooked: true,
                                assigned_team: team_number
                            }
                        },
                        { session }
                    );

                    // 2. הוספת האימון לקבוצה
                    await teamsCollection.updateOne(
                        { team_number },
                        {
                            $push: {
                                scheduled_sessions: {
                                    day,
                                    start_time,
                                    end_time,
                                    location
                                }
                            }
                        },
                        { session }
                    );
                }
            });

            res.status(200).json({ message: 'Assignments completed successfully' });
        } finally {
            await session.endSession();
        }
    } catch (error) {
        console.error('Error in assign-slots:', error);
        res.status(500).json({ message: 'Failed to assign slots' });
    }
}
