import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

const MoodForm = () => {
  const [mood, setMood] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioUrl]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/get_affirmation?mood=${mood}`);
      const { affirmation } = await res.json();
      setAffirmation(affirmation);
      const audioRes = await fetch(`/api/get_audio?affirmation=${affirmation}`);
      const audioBlob = await audioRes.blob();
      setAudioUrl(URL.createObjectURL(audioBlob));
    } catch (error) {
      setAffirmation("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <label htmlFor="mood" className="text-gray-800 text-lg mb-2">
          Enter your mood:
        </label>
        <input
          type="text"
          id="mood"
          name="mood"
          required
          className="border border-gray-300 rounded p-2 mb-4 w-full sm:w-1/2"
          value={mood}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setMood(e.target.value)}
        />
        <button
          type="submit"
          className="text-white font-semibold bg-indigo-500 px-6 py-2 rounded hover:bg-indigo-600"
        >
          Get Affirmation
        </button>
      </form>
      {loading ? (
        <div className="flex justify-center items-center mt-8">
          <div className="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      ) : (
        <>
          <p className="text-center mt-8 text-gray-700 text-xl">{affirmation}</p>
          {audioUrl && (
            <audio
              id="affirmation-audio"
              ref={audioRef}
              src={audioUrl}
              className="hidden"
            ></audio>
          )}
        </>
      )}
      <style jsx>{`
        .lds-ring {
          display: inline-block;
          position: relative;
          width: 80px;
          height: 80px;
        }

        .lds-ring div {
          box-sizing: border-box;
          display: block;
          position: absolute;
          width: 64px;
          height: 64px;
          margin: 8px;
          border: 8px solid #3b82f6;
          border-radius: 50%;
          animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          border-color: #3b82f6 transparent transparent transparent;
        }
        .lds-ring div:nth-child(1) {
          animation-delay: -0.45s;
        }

        .lds-ring div:nth-child(2) {
          animation-delay: -0.3s;
        }

        .lds-ring div:nth-child(3) {
          animation-delay: -0.15s;
        }

        @keyframes lds-ring {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default MoodForm;
