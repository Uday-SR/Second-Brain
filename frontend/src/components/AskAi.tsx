import { useEffect, useRef, useState } from "react";
import { aiService } from "../lib/api";

interface AskAiProps {
  onClose: () => void;
  contentId: number;
  link: string;
  type: string;
}

type Status = "pending" | "processing" | "done" | "failed" | "unknown";

// --------------------------------------------------
// Component
//
// Generalized from the YouTube-only version: processing is now triggered when
// content is first saved (see ContentModal), so this component's job is to
// poll status until it's ready, then let the user ask questions — for any
// source type, not just YouTube.
// --------------------------------------------------

export default function AskAi({ onClose, contentId, type }: AskAiProps) {
  const [status, setStatus] = useState<Status>("unknown");
  const [statusError, setStatusError] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  const pollRef = useRef<number | null>(null);

  const checkStatus = async () => {
    try {
      const res = await aiService.get(`/content/${contentId}/status`);
      setStatus(res.data.status);
      setStatusError(res.data.error || "");
      return res.data.status as Status;
    } catch {
      setStatus("unknown");
      return "unknown";
    }
  };

  useEffect(() => {
    checkStatus();

    pollRef.current = window.setInterval(async () => {
      const s = await checkStatus();
      if (s === "done" || s === "failed") {
        if (pollRef.current) window.clearInterval(pollRef.current);
      }
    }, 2500);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  const handleAsk = async () => {
    const cleanQuestion = question.trim();

    if (status !== "done") {
      setError("This content isn't ready to answer questions yet.");
      return;
    }
    if (!cleanQuestion) {
      setError("Please enter a question.");
      return;
    }

    setError("");
    setAsking(true);

    try {
      const res = await aiService.post("/ask", { content_id: contentId, question: cleanQuestion });
      setAnswer(res.data.answer || "I couldn't generate an answer.");
      setSources(res.data.sources || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Something went wrong while asking AI.");
    } finally {
      setAsking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const statusCopy: Record<Status, string> = {
    pending: "Queued for processing...",
    processing: "Reading and indexing this content...",
    done: "Ready — ask anything about it.",
    failed: statusError || "Processing failed.",
    unknown: `AI Q&A isn't available for '${type}' content yet.`,
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white text-black shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Ask AI</h2>
            <p className="text-xs text-gray-500">Ask questions about this content</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-black"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div
            className={`mb-5 flex items-center gap-2 rounded-2xl border p-4 text-sm ${
              status === "done"
                ? "border-green-200 bg-green-50 text-green-700"
                : status === "failed"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-gray-200 bg-gray-50 text-gray-600"
            }`}
          >
            {(status === "pending" || status === "processing") && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-400/40 border-t-gray-600" />
            )}
            {statusCopy[status]}
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="flex gap-2">
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {answer && (
            <div className="mb-5 space-y-4">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm text-white">
                  {question}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm">
                  ✨
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-gray-100 px-4 py-3 text-sm leading-6 text-gray-800">
                  <p className="whitespace-pre-wrap">{answer}</p>
                  {sources.length > 0 && (
                    <p className="mt-2 text-xs text-gray-500">From: {sources.join(", ")}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!answer && !asking && status === "done" && (
            <div className="py-10 text-center">
              <div className="mb-3 text-3xl">✨</div>
              <p className="font-medium">Ready</p>
              <p className="mt-1 text-sm text-gray-500">Ask anything about this content.</p>
            </div>
          )}

          {asking && (
            <div className="mb-5 flex items-center gap-3 text-sm text-gray-500">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">✨</div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-gray-100 px-4 py-3">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce [animation-delay:150ms]">•</span>
                <span className="animate-bounce [animation-delay:300ms]">•</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-white p-4">
          <div className="flex items-end gap-2 rounded-2xl border bg-gray-50 p-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status !== "done" || asking}
              rows={1}
              placeholder={status === "done" ? "Ask something..." : "Waiting for processing..."}
              className="max-h-28 min-h-[42px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleAsk}
              disabled={status !== "done" || !question.trim() || asking}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              title="Ask AI"
            >
              {asking ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <span>↑</span>
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            Press Enter to ask • Shift + Enter for a new line
          </p>
        </div>
      </div>
    </div>
  );
}
