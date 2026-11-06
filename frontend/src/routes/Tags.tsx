import { Link, useParams } from "react-router-dom";
import ContentPage from "../components/ContentPage";
import { Panel, PageColumn } from "../components/Panel";
import { useLibrary } from "../lib/library";

export default function Tags() {
  const { tags, loading } = useLibrary();

  return (
    <PageColumn>
      <Panel>
        {loading ? (
          <p className="text-gray-500">Loading tags...</p>
        ) : tags.length === 0 ? (
          <p className="text-gray-600">
            No tags yet. Add tags (comma separated, e.g. <span className="font-mono">ai, notes</span>) when you save
            content and they'll show up here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.key}
                to={`/tags/${encodeURIComponent(tag.key)}`}
                className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800 transition-colors hover:bg-purple-600 hover:text-white"
              >
                #{tag.label}
                <span className="rounded-full bg-white/70 px-2 text-xs text-purple-900">{tag.count}</span>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </PageColumn>
  );
}

// /tags/:tag — the items carrying one tag.
export function TagView() {
  const { tag = "" } = useParams();
  return <ContentPage category="all" tag={tag} />;
}
