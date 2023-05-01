import axios from 'axios';
import * as fs from 'fs';

export function loadMoodAffirmations(filePath: string) {
  const data = fs.readFileSync(filePath, "utf-8");
  const moodAffirmations = JSON.parse(data);
  return moodAffirmations;
}

const moodAffirmations = loadMoodAffirmations('mood_affirmations.json');
const moods = Object.keys(moodAffirmations);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface MoodEmbeddings {
  [mood: string]: number[];
}

const moodEmbeddings: MoodEmbeddings = {};

const url = 'https://api.openai.com/v1/embeddings';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${OPENAI_API_KEY}`,
};

export const generateEmbeddings = async () => {
  for (const mood of moods) {
    const data = {
      input: mood,
      model: 'text-embedding-ada-002',
    };

    try {
      const response = await axios.post(url, data, { headers });

      if (response.status !== 200) {
        console.error(
          `Error while getting embedding for ${mood}:`,
          response.status,
          response.data,
        );
        throw new Error('Failed to get embedding from OpenAI API');
      }

      const mood_embedding = response.data['data'][0]['embedding'];
      moodEmbeddings[mood] = mood_embedding;
      fs.writeFileSync(
        'public/knn_model/mood_embeddings.json',
        JSON.stringify(moodEmbeddings),
      );
    } catch (error) {
      console.error(error);
    }
  }

  return moodEmbeddings;
};

