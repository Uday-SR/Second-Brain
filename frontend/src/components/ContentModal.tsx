import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backend } from "../lib/api";

interface ContentModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

// Mirrors ai_service/app/loaders/__init__.py:detect_type — a best-effort guess
// so the "Type" field can default sensibly. The AI service re-detects from the
// real response headers/bytes before indexing, so a wrong guess here just means
// a wrong label, not a wrong pipeline.
function guessType(link: string): string {
  try {
    const url = new URL(link);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.toLowerCase();

    if (host === "youtu.be" || host.endsWith("youtube.com")) return "youtube";
    if (host === "twitter.com" || host === "x.com" || host.endsWith(".x.com")) return "twitter";
    if (host === "github.com") return "github";
    if (path.endsWith(".pdf")) return "pdf";
    if (path.endsWith(".md") || path.endsWith(".markdown")) return "markdown";
    if (path.endsWith(".txt")) return "text";
    return "article";
  } catch {
    return "url";
  }
}

const TYPE_LABELS: Record<string, string> = {
  youtube: "YouTube",
  twitter: "Twitter / X",
  article: "Web article",
  url: "Link",
  pdf: "PDF",
  markdown: "Markdown",
  text: "Text",
  github: "GitHub repo",
  image: "Image",
  audio: "Audio",
};

export default function ContentModal({ onClose, onCreated }: ContentModalProps) {
  const [mode, setMode] = useState<"link" | "file">("link");

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const detectedType = mode === "link" ? guessType(link) : "pdf"; // upload types added as more loaders ship

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please give it a title.");
      return;
    }
    if (mode === "link" && !link.trim()) {
      setError("Please paste a link.");
      return;
    }
    if (mode === "file" && !file) {
      setError("Please choose a file.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/intro");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      // File uploads don't have a URL yet — the file itself is the content, so
      // `link` is left for the backend to fill in once the AI service returns
      // where it stored the upload. For now we send a placeholder marker.
      const res = await backend.post("/content/", {
        title,
        link: mode === "link" ? link : `upload://${file!.name}`,
        tags,
        description,
        type: detectedType,
      });

      const contentId = res.data.id;

      if (mode === "link") {
        await import("../lib/api").then(({ aiService }) =>
          aiService.post("/content/process", { content_id: contentId, url: link, type: detectedType })
        );
      } else {
        const form = new FormData();
        form.append("file", file!);
        await import("../lib/api").then(({ aiService }) =>
          aiService.post(`/content/${contentId}/upload`, form, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        );
      }

      onCreated?.();
      onClose();
    } catch (err) {
      console.log("Error creating content", err);
      setError("Something went wrong while adding that. It was saved, but AI Q&A may not be ready yet.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-[9999]">
      <div className="bg-white text-black rounded-2xl shadow-2xl w-[90%] max-w-md p-6 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 hover:text-black">
          ✕
        </button>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              mode === "link" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Add a link
          </button>
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              mode === "file" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Upload a file
          </button>
        </div>

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            placeholder="Title"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {mode === "link" ? (
            <>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                type="text"
                placeholder="Paste any link — YouTube, X, an article, a PDF..."
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {link.trim() && (
                <p className="text-xs text-gray-500 -mt-2">Detected as: {TYPE_LABELS[detectedType]}</p>
              )}
            </>
          ) : (
            <input
              type="file"
              accept=".pdf,.md,.markdown,.txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="p-2 border rounded-md text-sm"
            />
          )}

          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            type="text"
            placeholder="Tags"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            type="text"
            placeholder="Description"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}
