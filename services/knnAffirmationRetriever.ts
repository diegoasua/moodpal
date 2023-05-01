import axios, { AxiosResponse } from "axios";
import 'dotenv/config';
import fs from "fs";

interface DataPoint {
    features: number[];
    label: string;
}

class KNearestNeighbors {
    private k: number;
    private data: DataPoint[];

    constructor(k: number, data: DataPoint[]) {
        this.k = k;
        this.data = data;
    }

    private euclideanDistance(a: number[], b: number[]): number {
        return Math.sqrt(a.reduce((sum, value, index) => sum + Math.pow(value - b[index], 2), 0));
    }

    private majorityVote(labels: string[]): string {
        const labelCount: Record<string, number> = {};
        labels.forEach((label) => {
            if (!labelCount.hasOwnProperty(label)) {
                labelCount[label] = 0;
            }
            labelCount[label]++;
        });

        let majorityLabel = "";
        let maxCount = 0;
        for (const [label, count] of Object.entries(labelCount)) {
            if (count > maxCount) {
                majorityLabel = label;
                maxCount = count;
            }
        }

        return majorityLabel;
    }

    predict(features: number[]): string {
        const distances: [number, DataPoint][] = this.data.map((dataPoint) => [
            this.euclideanDistance(features, dataPoint.features),
            dataPoint,
        ]);

        distances.sort(([a], [b]) => a - b);

        const kNearestLabels = distances.slice(0, this.k).map(([, dataPoint]) => dataPoint.label);

        return this.majorityVote(kNearestLabels);
    }
}

interface MoodEmbeddings {
    [key: string]: number[];
}

interface MoodAffirmations {
    [key: string]: string;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
const moodAffirmations: MoodAffirmations = loadMoodAffirmations("mood_affirmations.json");

function loadMoodEmbeddings(filename: string): MoodEmbeddings {
    const rawData = fs.readFileSync(filename);
    return JSON.parse(rawData.toString());
}

function loadMoodAffirmations(filePath: string): MoodAffirmations {
    const data = fs.readFileSync(filePath, "utf-8");
    const moodAffirmations = JSON.parse(data);
    return moodAffirmations;
}

async function moodToEmbedding(mood: string): Promise<number[]> {
    const url = "https://api.openai.com/v1/embeddings";
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
    };
    const data = { input: mood, model: "text-embedding-ada-002" };

    try {
        const response: AxiosResponse = await axios.post(url, data, { headers });
        const embedding = response.data.data[0].embedding;
        return embedding;
    } catch (error) {
        console.error("Error while getting embedding:", error);
        throw new Error("Failed to get embedding from OpenAI API");
    }
}

class KNNAffirmationRetriever {
    moodEmbeddings: MoodEmbeddings;
    moodAffirmations: MoodAffirmations;
    embeddings: number[][];
    moodLabels: string[];
    knnModel: KNearestNeighbors;

    constructor(moodEmbeddings: MoodEmbeddings, moodAffirmations: MoodAffirmations) {
        this.moodEmbeddings = moodEmbeddings;
        this.moodAffirmations = moodAffirmations;
        this.embeddings = Object.values(moodEmbeddings);
        this.moodLabels = Object.keys(moodEmbeddings);

        const dataPoints: DataPoint[] = this.embeddings.map((features: number[], index: number) => ({
            features,
            label: this.moodLabels[index],
        }));
        this.knnModel = new KNearestNeighbors(1, dataPoints);
    }


    async getAffirmation(mood: string): Promise<string> {
        const moodEmbedding = await moodToEmbedding(mood);
        // Predict the closest mood using the KNN model
        const closestMood = this.knnModel.predict((moodEmbedding as number[]));

        // Access the affirmation using the closest mood
        const affirmation = this.moodAffirmations[closestMood];
        return affirmation;
    }

}
const isDevelopment = process.env.NODE_ENV === "development";
const filePath = isDevelopment ? "public/knn_model/mood_embeddings.json" : "/knn_model/mood_embeddings.json";
const moodEmbeddings: MoodEmbeddings = loadMoodEmbeddings(filePath);
const knn = new KNNAffirmationRetriever(moodEmbeddings, moodAffirmations);

export default knn;     
