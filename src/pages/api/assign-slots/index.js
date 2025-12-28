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

        const slotUpdates = [];
        const teamUpdates = [];

        for (const assignment of assignments) {
            const { team_number, day, start_time, end_time, location } = assignment;

            slotUpdates.push({
                updateOne: {
                    filter: {
                        day,
                        start_time,
                        end_time,
                        location,
                        isBooked: { $ne: true }
                    },
                    update: {
                        $set: {
                            isBooked: true,
                            assigned_team: team_number
                        }
                    }
                }
            });

            teamUpdates.push({
                updateOne: {
                    filter: { team_number },
                    update: {
                        $push: {
                            scheduled_sessions: {
                                day,
                                start_time,
                                end_time,
                                location
                            }
                        }
                    }
                }
            });
        }

        if (slotUpdates.length === 0) {
            return res.status(200).json({ message: 'No assignments to process' });
        }

        const [slotResult, teamResult] = await Promise.all([
            slotsCollection.bulkWrite(slotUpdates, { ordered: false }),
            teamsCollection.bulkWrite(teamUpdates, { ordered: false })
        ]);

        res.status(200).json({
            message: 'Assignments completed successfully',
            slotUpdates: slotResult.modifiedCount,
            teamUpdates: teamResult.modifiedCount
        });
    } catch (error) {
        console.error('Error in assign-slots:', error);
        res.status(500).json({ message: 'Failed to assign slots' });
    }
}
