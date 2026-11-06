import { Link, useNavigate } from "react-router-dom";
import { Panel, PageColumn } from "../components/Panel";
import { signOut } from "../lib/api";
import { formatDate, TYPE_LABELS } from "../lib/content";
import { useLibrary } from "../lib/library";

export default function Profile() {
  const { user, items, tags, loading } = useLibrary();
  const navigate = useNavigate();

  const initial = (user?.username || user?.email || "?").trim().charAt(0).toUpperCase() || "?";
  const ready = items.filter((i) => i.status === "DONE").length;

  const byType = Object.entries(
    items.reduce<Record<string, number>>((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const maxCount = byType[0]?.[1] || 1;

  const recent = items.slice(0, 5); // API returns newest first

  return (
    <PageColumn>
      <Panel>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-purple-600 text-2xl font-medium text-white">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold">{user?.username || user?.email?.split("@")[0] || "Your account"}</h2>
            <p className="truncate text-sm text-gray-500">{user?.email || "Profile details are unavailable right now."}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/settings" className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
              Settings
            </Link>
            <button
              onClick={() => {
                signOut();
                navigate("/", { replace: true });
              }}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {[
            ["Saved items", items.length],
            ["AI-ready", ready],
            ["Tags", tags.length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-gray-50 py-3">
              <p className="text-2xl font-semibold">{loading ? "–" : value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="What you've saved">
        {byType.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing yet — hit “Add” to save your first item.</p>
        ) : (
          <ul className="space-y-2">
            {byType.map(([type, count]) => (
              <li key={type} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 text-gray-600">{TYPE_LABELS[type] || type}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <span className="block h-full rounded-full bg-purple-500" style={{ width: `${(count / maxCount) * 100}%` }} />
                </span>
                <span className="w-6 text-right font-medium">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {tags.length > 0 && (
        <Panel title="Top tags">
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 12).map((t) => (
              <Link
                key={t.key}
                to={`/tags/${encodeURIComponent(t.key)}`}
                className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800 hover:bg-purple-600 hover:text-white"
              >
                #{t.label} <span className="text-xs opacity-70">{t.count}</span>
              </Link>
            ))}
          </div>
        </Panel>
      )}

      {recent.length > 0 && (
        <Panel title="Recently added">
          <ul className="divide-y divide-gray-100">
            {recent.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 truncate font-medium">{item.title}</span>
                <span className="shrink-0 text-xs text-gray-500">
                  {TYPE_LABELS[item.type] || item.type}
                  {item.createdAt ? ` · ${formatDate(item.createdAt)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </PageColumn>
  );
}
