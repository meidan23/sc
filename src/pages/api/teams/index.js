import { connectToDatabase } from '../middleware/mongo';

export default async function handler(req, res) {
    const db = await connectToDatabase();
    const collection = db.collection('teams');

    if (req.method === 'POST') {
        const { name, number } = req.body;

        try {
            const result = await collection.insertOne({ name, number });
            res.status(201).json({ message: 'Team added', team: result.ops[0] });
        } catch (error) {
            res.status(500).json({ message: 'Failed to add team', error: error.message });
        }
    } else if (req.method === 'GET') {
        try {
            const teams = await collection.find({}).toArray();
            res.status(200).json(teams);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch teams', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
