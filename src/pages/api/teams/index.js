import { connectToDatabase } from '../middleware/mongo';

export default async function handler(req, res) {
    const db = await connectToDatabase();
    const teamsCollection = db.collection('teams');
    const slotsCollection = db.collection('slots');

    if (req.method === 'POST') {
        const { team_number, day, location, start_time, end_time } = req.body;

        try {
            // עדכון הסלוט כדי לסמן שהוא תפוס ולהוסיף את מספר הקבוצה
            const result = await slotsCollection.updateOne(
                { day, location, start_time, end_time, isBooked: false },
                {
                    $set: {
                        isBooked: true,
                        assigned_team: team_number, // שמירת מספר הקבוצה במקום ID
                    },
                }
            );

            if (result.modifiedCount === 1) {
                // עדכון הקבוצה כדי להוסיף את האימון לרשימת האימונים
                await teamsCollection.updateOne(
                    { team_number },
                    { $push: { scheduled_sessions: { day, location, start_time, end_time } } }
                );

                res.status(200).json({ message: `הסלוט שובץ בהצלחה לקבוצה ${team_number}` });
            } else {
                res.status(404).json({ message: "סלוט לא נמצא או כבר תפוס" });
            }
        } catch (error) {
            res.status(500).json({ message: 'Failed to schedule slot', error: error.message });
        }
    } else if (req.method === 'GET') {
        try {
            const teams = await teamsCollection.find({}).toArray();
            res.status(200).json(teams);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch teams', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
