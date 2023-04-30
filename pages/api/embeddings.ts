import { NextApiRequest, NextApiResponse } from 'next';
import { generateEmbeddings } from '../../utilities/generateEmbeddings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const embeddings = await generateEmbeddings();
    res.status(200).json(embeddings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate embeddings' });
  }
}

