import { useMemo, useRef, useState } from "react";
import { backend } from "../lib/api";
import { itemsInScope, type Scope } from "../lib/content";
import { useLibrary } from "../lib/library";
import { encodeSnapshot } from "../lib/snapshot";
import { CopyIcon } from "../icons/CopyIcon";
import { CheckIcon } from "../icons/CheckIcon";

interface ShareModalProps {
  onClose: () => void;
  scope: Scope;
}

interface Created {
  url: string;
  kind: "live" | "snapshot";
  expiresInDays?: number;
}

export default function ShareModal({ onClose, scope }: ShareModalProps) {
  const { items, user } = useLibrary();

  const scoped = scope.label !== "Everything";
  const [choice, setChoice] = useState<"scope" | "all">(scoped ? "scope" : "all");

  const [created, setCreated] = useState<Created | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => itemsInScope(items, choice === "all" ? null : scope), [choice, items, scope]);

  const choose = (next: "scope" | "all") => {
    setChoice(next);
    setCreated(null);
    setCopied(false);
    setError("");
  };

  const createLink = async () => {
    setError("");
    setCreating(true);

    const label = choice === "all" ? "Everything" : scope.label;

    try {

      const body = choice === "all" ? { label } : { label, types: scope.types, tag: scope.tag, ids: scope.ids };
      const res = await backend.post<{ token: string; expiresInDays: number }>("/content/share", body);
      setCreated({
        url: `${window.location.origin}/share/${res.data.token}`,
        kind: "live",
        expiresInDays: res.data.expiresInDays,
      });
    } catch (e: any) {
      console.log("Live share link failed, trying a snapshot link", e);

      const encoded = encodeSnapshot(user?.username || "Someone", label, selected);
      if (encoded) {
        setCreated({ url: `${window.location.origin}/share/snapshot#${encoded}`, kind: "snapshot" });
      } else {
        setError(
          e?.response?.status === 404
            ? "The backend has no share endpoint yet — deploy the updated backend. (A snapshot link would be too long for this many items.)"
            : "Couldn't create a share link. Check your connection, or try sharing fewer items."
        );
      }
    } finally {
      setCreating(false);
    }
  };

  const copy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.url);
    } catch {
      inputRef.current?.select();
      document.execCommand("copy");
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const count = selected.length;

  const optionClass = (active: boolean) =>
    `min-w-0 flex-1 truncate rounded-md px-2 py-2 text-sm font-medium ${active ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-md"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-h-[92vh] w-[92%] max-w-md overflow-y-auto rounded-2xl bg-white p-5 text-black shadow-2xl sm:p-6">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 hover:text-black" aria-label="Close">
          ✕
        </button>

        <h2 className="mb-1 text-center text-2xl font-bold">Share your brain</h2>
        <p className="mb-4 text-center text-sm text-gray-500">
          Create a read-only link anyone can open — no account needed.
        </p>

        {scoped && (
          <div className="mb-4 flex gap-2">
            <button type="button" onClick={() => choose("scope")} className={optionClass(choice === "scope")}>
              {scope.label}
            </button>
            <button type="button" onClick={() => choose("all")} className={optionClass(choice === "all")}>
              Everything
            </button>
          </div>
        )}

        <p className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
          {count === 0
            ? "There's nothing to share here yet — add some content first."
            : `${count} item${count === 1 ? "" : "s"} will be visible: titles, links, descriptions and tags. Your email, account and AI chats stay private.`}
        </p>

        {created ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-1 pl-3">
              <input
                ref={inputRef}
                readOnly
                value={created.url}
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
              <button
                onClick={copy}
                className="flex items-center gap-1 rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
              >
                {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="flex gap-2">
              {canNativeShare && (
                <button
                  onClick={() => navigator.share({ title: "My ReMind", url: created.url }).catch(() => undefined)}
                  className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Share via…
                </button>
              )}
              <a
                href={created.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-gray-100 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Preview
              </a>
            </div>

            <p className="text-center text-xs text-gray-400">
              {created.kind === "live"
                ? `Live link — new items in this selection appear automatically. Expires in ${created.expiresInDays} days.`
                : "Snapshot link — a copy of these items as they are now. It won't update and never expires."}
            </p>
          </div>
        ) : (
          <button
            onClick={createLink}
            disabled={creating || count === 0}
            className="w-full rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors duration-300 hover:bg-purple-700 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create share link"}
          </button>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
