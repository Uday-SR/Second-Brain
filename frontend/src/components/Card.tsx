import { DocIcon } from "../icons/DocIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Ai } from "../icons/Ai";
import AskAi from "./AskAi";
import { backend } from "../lib/api";
import { useState } from "react";

interface CardProps {
  id: number;
  title: string;
  link: string;
  description: string;
  tags: string;
  type: string; // youtube | twitter | article | url | pdf | markdown | text | github | image | audio
  status?: string; // PENDING | PROCESSING | DONE | FAILED
  onDelete: (id: number) => void;
  onRefresh?: () => void;
}

// Small badge so users can see at a glance whether AI Q&A is ready for this
// item, instead of only discovering it when they open the Ask AI panel.
function StatusDot({ status }: { status?: string }) {
  if (!status || status === "DONE") return null;
  const color =
    status === "FAILED" ? "bg-red-400" : status === "PROCESSING" ? "bg-yellow-400" : "bg-gray-300";
  const title = status === "FAILED" ? "Processing failed" : status === "PROCESSING" ? "Processing..." : "Queued";
  return <span title={title} className={`h-2 w-2 rounded-full ${color}`} />;
}

export function Card({ id, title, link, description, tags, type, status, onDelete, onRefresh }: CardProps) {
  const [showAi, setShowAi] = useState(false);

  const deleteContent = async (id: number) => {
    try {
      await backend.delete(`/content/${id}`);
      onDelete(id);
    } catch (error) {
      console.log("Error deleting content", error);
    }
  };

  return (
    <div className="group relative left-2 mx-2 my-4 w-40 sm:w-50 h-60 rounded-md bg-white border border-gray-200 transition-all duration-200 hover:w-50 sm:hover:w-60 hover:h-65 hover:bg-emerald-300 hover:z-5 hover:shadow-xl flex flex-col overflow-visible z-1">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="text-gray-500 flex items-center space-x-2 font-normal truncate">
          <DocIcon />
          <h3 className="truncate">{title}</h3>
          <StatusDot status={status} />
        </div>
        <div className="flex space-x-3">
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-500">
            <ShareIcon />
          </a>
          <button
            className="text-gray-300 hover:text-red-500"
            onClick={() => {
              if (confirm("Are you sure you want to delete this?")) {
                deleteContent(id);
              }
              if (onRefresh) onRefresh();
            }}
          >
            <DeleteIcon />
          </button>
          <button className="text-gray-300 hover:text-cyan-300" onClick={() => setShowAi(true)}>
            <Ai />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
        <div className="flex-1 min-h-[120px] overflow-hidden hover:overflow-auto rounded border border-gray-200">
          {type === "youtube" && (
            <div className="relative w-full pb-[56.25%]">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={link.replace("https://youtu.be/", "https://www.youtube.com/embed/")}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {type === "twitter" && (
            <div className="w-full">
              <blockquote className="twitter-tweet w-full">
                <a href={link}></a>
              </blockquote>
            </div>
          )}

          {(type === "article" || type === "url" || type === "github") && (
            <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-xs text-gray-500">
              <span className="text-2xl">{type === "github" ? "📚" : "🔗"}</span>
              <span className="truncate w-full">{link}</span>
            </div>
          )}

          {type === "pdf" && (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-gray-500">
              <span className="text-2xl">📄</span>
              <span className="text-xs">PDF</span>
            </div>
          )}

          {(type === "markdown" || type === "text") && (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-gray-500">
              <span className="text-2xl">📝</span>
              <span className="text-xs">{type === "markdown" ? "Markdown" : "Text"}</span>
            </div>
          )}

          {type === "image" && (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-gray-500">
              <span className="text-2xl">📸</span>
              <span className="text-xs">Image</span>
            </div>
          )}

          {type === "audio" && (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-gray-500">
              <span className="text-2xl">🎙️</span>
              <span className="text-xs">Audio</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-[80px] overflow-hidden hover:overflow-auto rounded border border-gray-200 p-2 text-sm text-gray-700 bg-gray-50">
          {description}
          {tags && <p className="mt-1 text-xs text-gray-400 truncate">{tags}</p>}
        </div>
      </div>

      {showAi && <AskAi onClose={() => setShowAi(false)} contentId={id} link={link} type={type} />}
    </div>
  );
}
