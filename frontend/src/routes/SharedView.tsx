import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Backdrop from "../components/Backdrop";
import { backend } from "../lib/api";
import { formatDate, isUploadLink, parseTags, TYPE_LABELS, youtubeThumbnail, type SharedPayload } from "../lib/content";
import { decodeSnapshot } from "../lib/snapshot";


export default function SharedView() {
  const { token = "" } = useParams();
  const [data, setData] = useState<SharedPayload | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    if (token === "snapshot") {
      const decoded = decodeSnapshot(window.location.hash);
      if (decoded) setData(decoded);
      else setError("This snapshot link is incomplete or damaged.");
      return;
    }

    backend
      .get<SharedPayload>(`/content/shared/${encodeURIComponent(token)}`)
      .then((res) => !cancelled && setData(res.data))
      .catch((e) => {
        if (cancelled) return;
        setError(
          e?.response?.status === 404
            ? "This share link is invalid or has expired."
            : "Couldn't load this shared page. Please try again later."
        );
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const types = useMemo(() => [...new Set((data?.contents || []).map((c) => c.type))], [data]);
  const visible = (data?.contents || []).filter((c) => filter === "all" || c.type === filter);

  return (
    <div className="relative isolate min-h-dvh w-full">
      <Backdrop />

      <div className="mx-auto max-w-5xl p-4 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-white">
          <div>
            <p className="font-serif text-2xl italic drop-shadow-lg">ReMind</p>
            {data && (
              <p className="text-sm text-white/80 drop-shadow">
                {data.owner}'s {data.label && data.label !== "Everything" ? data.label.toLowerCase() : "shared collection"} ·{" "}
                {data.contents.length} item{data.contents.length === 1 ? "" : "s"}
              </p>
            )}
          </div>
          <Link to="/" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-700">
            Create your own
          </Link>
        </div>

        {error && <div className="rounded-2xl bg-white/95 p-6 text-center text-gray-700 shadow-xl">{error}</div>}
        {!error && !data && <p className="text-center text-white drop-shadow-md">Loading...</p>}

        {data && types.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {["all", ...types].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  filter === t ? "bg-purple-600 text-white" : "bg-white/90 text-gray-700 hover:bg-white"
                }`}
              >
                {t === "all" ? "All" : TYPE_LABELS[t] || t}
              </button>
            ))}
          </div>
        )}

        {data && data.contents.length === 0 && (
          <div className="rounded-2xl bg-white/95 p-6 text-center text-gray-600 shadow-xl">Nothing has been shared here yet.</div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => {
            const thumb = item.type === "youtube" ? youtubeThumbnail(item.link) : null;
            const openable = !isUploadLink(item.link);
            return (
              <article key={item.id} className="flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white text-black shadow-md">
                {thumb && <img src={thumb} alt="" loading="lazy" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} className="aspect-video w-full object-cover" />}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <span className="w-fit rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {TYPE_LABELS[item.type] || item.type}
                  </span>
                  <h3 className="font-medium">{item.title}</h3>
                  {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                  {parseTags(item.tags).length > 0 && (
                    <p className="text-xs text-gray-400">{parseTags(item.tags).map((t) => `#${t}`).join("  ")}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2 text-xs text-gray-400">
                    <span>{formatDate(item.createdAt)}</span>
                    {openable && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
                      >
                        Open
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
