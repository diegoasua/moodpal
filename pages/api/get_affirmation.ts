import { NextApiRequest, NextApiResponse } from 'next';
import knn from '../../services/knnAffirmationRetriever';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { mood } = req.query;

  if (req.method === 'GET' && mood) {
    try {
      const affirmation = await knn.getAffirmation(mood as string);
      res.status(200).json({ affirmation });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred. Please try again.' });
    }
  } else {
    res.status(400).json({ error: 'Invalid request method or missing mood parameter.' });
  }
}
