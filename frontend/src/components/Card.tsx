import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import AskAi from "./AskAi";
import { Ai } from "../icons/Ai";
import { DeleteIcon } from "../icons/DeleteIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { CopyIcon } from "../icons/CopyIcon";
import { CheckIcon } from "../icons/CheckIcon";
import { PencilIcon } from "../icons/PencilIcon";
import { StarIcon } from "../icons/StarIcon";
import { ExternalIcon } from "../icons/ExternalIcon";
import {
  AI_TYPES,
  formatDate,
  hostOf,
  isUploadLink,
  parseTags,
  TYPE_LABELS,
  youtubeEmbedUrl,
  youtubeThumbnail,
  type ContentItem,
} from "../lib/content";

interface CardProps {
  item: ContentItem;
  favorite: boolean;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => Promise<void>;
}

const TYPE_STYLE: Record<string, { badge: string; panel: string; emoji: string }> = {
  youtube: { badge: "bg-red-100 text-red-700", panel: "from-red-100 to-rose-50", emoji: "▶️" },
  twitter: { badge: "bg-sky-100 text-sky-700", panel: "from-sky-100 to-blue-50", emoji: "🐦" },
  article: { badge: "bg-emerald-100 text-emerald-700", panel: "from-emerald-100 to-teal-50", emoji: "📰" },
  url: { badge: "bg-slate-100 text-slate-700", panel: "from-slate-100 to-gray-50", emoji: "🔗" },
  github: { badge: "bg-violet-100 text-violet-700", panel: "from-violet-100 to-purple-50", emoji: "📚" },
  pdf: { badge: "bg-orange-100 text-orange-700", panel: "from-orange-100 to-amber-50", emoji: "📄" },
  markdown: { badge: "bg-indigo-100 text-indigo-700", panel: "from-indigo-100 to-blue-50", emoji: "📝" },
  text: { badge: "bg-stone-100 text-stone-700", panel: "from-stone-100 to-neutral-50", emoji: "📝" },
  image: { badge: "bg-pink-100 text-pink-700", panel: "from-pink-100 to-rose-50", emoji: "📸" },
  audio: { badge: "bg-amber-100 text-amber-700", panel: "from-amber-100 to-yellow-50", emoji: "🎙️" },
};

let twitterScript: Promise<void> | null = null;
function loadTwitterWidgets(): Promise<void> {
  if (!twitterScript) {
    twitterScript = new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = "https://platform.twitter.com/widgets.js";
      el.async = true;
      el.onload = () => resolve();
      el.onerror = () => {
        twitterScript = null; 
        reject(new Error("Could not load Twitter widgets"));
      };
      document.body.appendChild(el);
    });
  }
  return twitterScript;
}

function YoutubePreview({ link, title }: { link: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const thumb = youtubeThumbnail(link);

  if (playing) {
    return (
      <iframe
        className="h-full w-full"
        src={`${youtubeEmbedUrl(link)}?autoplay=1`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="group/play relative h-full w-full overflow-hidden bg-gradient-to-br from-red-100 to-rose-50"
      aria-label={`Play ${title}`}
    >
      {thumb && !thumbFailed && (
        <img
          src={thumb}
          alt=""
          loading="lazy"
          onError={() => setThumbFailed(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover/play:scale-105"
        />
      )}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-red-600/90 pl-1 text-xl text-white shadow-lg transition-transform group-hover/play:scale-110">
          ▶
        </span>
      </span>
    </button>
  );
}

function TweetPreview({ link }: { link: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    loadTwitterWidgets()
      .then(() => (window as any).twttr?.widgets?.load(el))
      .catch(() => undefined); // offline / blocked: the plain link stays visible
  }, [link]);

  const embedHref = link.replace("://x.com/", "://twitter.com/").replace("://www.x.com/", "://twitter.com/");

  return (
    <div ref={ref} className="h-full w-full overflow-auto bg-white p-2 pt-9">
      <blockquote className="twitter-tweet" data-conversation="none">
        <a href={embedHref}>{link}</a>
      </blockquote>
    </div>
  );
}

function SitePreview({ link, type }: { link: string; type: string }) {
  const host = hostOf(link);
  const [iconFailed, setIconFailed] = useState(false);
  const style = TYPE_STYLE[type] || TYPE_STYLE.url;

  return (
    <div className={`flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br ${style.panel} p-3 text-center`}>
      {host && !iconFailed ? (
        <img
          src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
          alt=""
          onError={() => setIconFailed(true)}
          className="size-10 rounded-lg bg-white p-1 shadow"
        />
      ) : (
        <span className="text-3xl">{style.emoji}</span>
      )}
      <span className="max-w-full truncate text-sm font-medium text-gray-700">{host || link}</span>
    </div>
  );
}

function FilePreview({ link, type }: { link: string; type: string }) {
  const style = TYPE_STYLE[type] || TYPE_STYLE.text;
  const fileName = isUploadLink(link) ? link.replace("upload://", "") : hostOf(link);
  return (
    <div className={`flex h-full flex-col items-center justify-center gap-1 bg-gradient-to-br ${style.panel} p-3 text-center`}>
      <span className="text-4xl">{style.emoji}</span>
      <span className="text-xs font-medium uppercase tracking-wide text-gray-600">{TYPE_LABELS[type] || type}</span>
      {fileName && <span className="max-w-full truncate text-xs text-gray-500">{fileName}</span>}
    </div>
  );
}

function AiStatus({ item }: { item: ContentItem }) {
  if (!AI_TYPES.has(item.type)) return null; 
  const s = item.status;
  if (s === "DONE") return <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">AI ready</span>;
  if (s === "FAILED")
    return (
      <span title={item.error || "Processing failed"} className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
        AI failed
      </span>
    );
  return (
    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
      <span className="size-2 animate-spin rounded-full border border-amber-500 border-t-transparent" />
      {s === "PROCESSING" ? "Indexing" : "Queued"}
    </span>
  );
}

function IconButton({ label, onClick, children, className = "" }: { label: string; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex size-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 [&_svg]:size-[18px] ${className}`}
    >
      {children}
    </button>
  );
}

export function Card({ item, favorite, onToggleFavorite, onEdit, onShare, onDelete }: CardProps) {
  const { title, link, description, tags, type, createdAt } = item;

  const [showAi, setShowAi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const style = TYPE_STYLE[type] || TYPE_STYLE.url;
  const tagList = parseTags(tags);
  const openable = !isUploadLink(link);
  const aiSupported = AI_TYPES.has(type);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await onDelete();
    } catch (e) {
      console.log("Error deleting content", e);
      setDeleteError("Couldn't delete this. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-800 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
      {/* Preview */}
      <div className={`relative overflow-hidden bg-gray-50 ${type === "twitter" ? "h-56" : "h-40"}`}>
        {type === "youtube" && <YoutubePreview link={link} title={title} />}
        {type === "twitter" && <TweetPreview link={link} />}
        {["article", "url", "github"].includes(type) && <SitePreview link={link} type={type} />}
        {["pdf", "markdown", "text", "image", "audio"].includes(type) && <FilePreview link={link} type={type} />}

        <span className={`pointer-events-none absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-medium shadow-sm ${style.badge}`}>
          {TYPE_LABELS[type] || type}
        </span>

        <button
          onClick={onToggleFavorite}
          aria-pressed={favorite}
          title={favorite ? "Remove from favorites" : "Add to favorites"}
          className={`absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 shadow transition-colors ${
            favorite ? "text-amber-500" : "text-gray-400 hover:text-amber-500"
          }`}
        >
          <StarIcon className="size-4.5" filled={favorite} />
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          {openable ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              className="line-clamp-2 font-semibold leading-snug hover:text-purple-700"
            >
              {title}
            </a>
          ) : (
            <h3 title={title} className="line-clamp-2 font-semibold leading-snug">{title}</h3>
          )}
        </div>

        {description && <p className="line-clamp-3 text-sm text-gray-600">{description}</p>}

        {tagList.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tagList.slice(0, 4).map((t) => (
              <Link
                key={t}
                to={`/tags/${encodeURIComponent(t.toLowerCase())}`}
                className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 hover:bg-purple-600 hover:text-white"
              >
                #{t}
              </Link>
            ))}
            {tagList.length > 4 && <span className="px-1 text-xs text-gray-400">+{tagList.length - 4}</span>}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-1 text-xs text-gray-400">
          <span>{formatDate(createdAt)}</span>
          <AiStatus item={item} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-1 border-t border-gray-100 px-3 py-2">
        <button
          onClick={() => setShowAi(true)}
          title={aiSupported ? "Ask AI about this" : "Ask AI isn't available for this type yet"}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
            aiSupported ? "bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white" : "bg-gray-50 text-gray-400"
          }`}
        >
          <Ai size={16} className="size-4" /> Ask AI
        </button>

        {openable && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            title="Open original"
            aria-label="Open original"
            className="flex size-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 [&_svg]:size-[18px]"
          >
            <ExternalIcon />
          </a>
        )}

        <div className="ml-auto flex items-center">
          {openable && (
            <IconButton label={copied ? "Copied!" : "Copy link"} onClick={copyLink} className={copied ? "text-green-600" : ""}>
              {copied ? <CheckIcon /> : <CopyIcon />}
            </IconButton>
          )}
          <IconButton label="Share this item" onClick={onShare}><ShareIcon /></IconButton>
          <IconButton label="Edit" onClick={onEdit}><PencilIcon /></IconButton>
          <IconButton label="Delete" onClick={() => setConfirming(true)} className="hover:!bg-red-50 hover:!text-red-500">
            <DeleteIcon />
          </IconButton>
        </div>
      </div>

      {/* Inline delete confirmation*/}
      {confirming && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/95 p-4 text-center backdrop-blur-sm">
          <p className="font-medium">Delete “{title}”?</p>
          <p className="text-xs text-gray-500">This also removes it from AI search. It can't be undone.</p>
          {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
          <div className="flex gap-2">
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={() => {
                setConfirming(false);
                setDeleteError("");
              }}
              disabled={deleting}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showAi && <AskAi onClose={() => setShowAi(false)} contentId={item.id} link={link} type={type} />}
    </article>
  );
}
