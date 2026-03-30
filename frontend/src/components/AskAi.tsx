import { useState } from "react";

interface AuthModalProps {
  onClose: () => void;
  link: string
}

export default function AskAi({ onClose, link }: AuthModalProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const video_id = "";


  const handleProcess = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: link,
          video_id: video_id,
        }),
      });

      const data = await res.json();
      console.log(data);

    } catch (err) {
      console.error(err);
      alert("Error processing video");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAnswer(data.answer);

    } catch (err) {
      console.error(err);
      alert("Error asking question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-[9999]">
      <div className="bg-white text-black rounded-2xl shadow-2xl w-[90%] max-w-md p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <p className="text-sm mb-3 text-gray-600">
          Video ID: {video_id}
        </p>

        <button
          onClick={handleProcess}
          className="w-full bg-blue-500 text-white p-2 rounded mb-4"
        >
          {loading ? "Processing..." : "Process Video"}
        </button>

        <input
          type="text"
          placeholder="Ask something..."
          className="w-full border p-2 mb-3 rounded"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button
          onClick={handleAsk}
          className="w-full bg-gray-500 text-white p-2 rounded-2xl"
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>

        {answer && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <strong>Answer:</strong>
            <p>{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}