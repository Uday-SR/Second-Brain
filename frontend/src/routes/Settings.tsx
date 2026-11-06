import { useNavigate } from "react-router-dom";
import { Panel, PageColumn } from "../components/Panel";
import { AI_SERVICE_URL, BACKEND_URL, signOut } from "../lib/api";
import { TYPE_LABELS } from "../lib/content";
import { useLibrary } from "../lib/library";
import { useAiTypes } from "../lib/useAiTypes";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="min-w-0 truncate font-medium">{value}</span>
    </div>
  );
}

export default function Settings() {
  const { user, items, refresh } = useLibrary();
  const { types, online, recheck } = useAiTypes();
  const navigate = useNavigate();

  const exportLibrary = () => {
    const data = items.map(({ id, title, link, description, tags, type, createdAt }) => ({
      id, title, link, description, tags, type, createdAt,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `remind-library-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageColumn>
      <Panel title="Account">
        <div className="divide-y divide-gray-100">
          <Row label="Username" value={user?.username || "—"} />
          <Row label="Email" value={user?.email || "—"} />
        </div>
        <p className="mt-3 text-xs text-gray-400">Account details are read-only for now.</p>
      </Panel>

      <Panel title="AI service">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                online === null ? "animate-pulse bg-gray-300" : online ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {online === null ? "Checking..." : online ? "Connected" : "Not reachable — Ask AI won't work until it's running"}
          </span>
          <button onClick={recheck} className="rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-200">
            Check again
          </button>
        </div>

        <div className="mt-3 divide-y divide-gray-100">
          <Row label="AI service" value={AI_SERVICE_URL} />
          <Row label="Backend" value={BACKEND_URL} />
        </div>

        <p className="mt-3 text-sm text-gray-500">Ask AI works for:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[...types].sort().map((t) => (
            <span key={t} className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              {TYPE_LABELS[t] || t}
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="Your data">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportLibrary}
            disabled={items.length === 0}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            Export library (.json)
          </button>
          <button
            onClick={() => void refresh()}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Refresh from server
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          The export includes titles, links, descriptions, tags and types for all {items.length} saved items.
        </p>
      </Panel>

      <Panel title="Session">
        <button
          onClick={() => {
            signOut();
            navigate("/", { replace: true });
          }}
          className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          Sign out
        </button>
      </Panel>
    </PageColumn>
  );
}
