// generateAudioFiles.mjs
import fs from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ELEVENLABS_KEY = process.env.ELEVENLABS_KEY;
const affirmations = JSON.parse(
    await fs.readFile(new URL("./mood_affirmations.json", import.meta.url))
);

async function generateAudio(text) {
    const { default: fetch } = await import("node-fetch");

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

    const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
        requestOptions
    );

    if (response.status === 200) {
        const buffer = Buffer.from(await response.arrayBuffer());
        return buffer;
    } else {
        throw new Error(`Error generating audio: ${response.statusText}`);
    }
}

async function saveAudioFile(mood, audioBuffer) {
    const filePath = path.join(__dirname, "public/audio", `${mood}.mp3`);

    await fs.writeFile(filePath, audioBuffer);
    return filePath;
}

(async () => {
    try {
        const audioDir = path.join(__dirname, "audio");

        try {
            await fs.mkdir(audioDir);
        } catch (error) {
            if (error.code !== "EEXIST") {
                throw error;
            }
        }

        for (const mood in affirmations) {
            const affirmation = affirmations[mood];
            const audioBuffer = await generateAudio(affirmation);
            const filePath = await saveAudioFile(mood, audioBuffer);
            console.log(`Generated and saved audio for ${mood}: ${filePath}`);
        }
    } catch (error) {
        console.error("Error generating audio files:", error);
    }
})();
