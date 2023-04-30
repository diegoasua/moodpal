import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { text } = req.query;
  const ELEVENLABS_KEY = process.env.ELEVENLABS_KEY as string;

  const requestBody = {
    text,
    model_id: "eleven_monolingual_v1",
    voice_settings: {
      stability: 0,
      similarity_boost: 0,
    },
  };

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_KEY,
    },
    body: JSON.stringify(requestBody),
  };

  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
      requestOptions
    );

    if (response.status === 200) {
      const buffer = Buffer.from(await response.arrayBuffer());

      res.setHeader("Content-Type", "audio/mpeg");
      res.send(buffer);
    } else if (response.status === 422) {
      const jsonResponse = await response.json();
      res.status(422).json(jsonResponse);
    } else {
      res.status(response.status).send(response.statusText);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}
