import { promises as fs } from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { affirmation } = req.query;

  const moodAffirmationsPath = path.join(process.cwd(), "mood_affirmations.json");

  try {
    const moodAffirmationsRaw = await fs.readFile(moodAffirmationsPath, "utf-8");
    const moodAffirmations = JSON.parse(moodAffirmationsRaw);

    let emotion = null;
    for (const [key, value] of Object.entries(moodAffirmations)) {
      if (value === affirmation) {
        emotion = key;
        break;
      }
    }

    if (!emotion) {
      res.status(404).send("Emotion not found");
      return;
    }
    const audioPath = path.join(process.cwd(), "public", "audio", `${emotion}.mp3`);

    const audioBuffer = await fs.readFile(audioPath);

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audioBuffer);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      res.status(404).send("Audio file not found");
    } else {
      res.status(500).send(error.message);
    }
  }
}
