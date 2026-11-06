import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Card } from "./Card";
import EditModal from "./EditModal";
import { SearchIcon } from "../icons/SearchIcon";
import { StarIcon } from "../icons/StarIcon";
import { useLibrary } from "../lib/library";
import { CATEGORIES, itemsInScope, matchesQuery, type CategoryKey, type ContentItem } from "../lib/content";
import type { LayoutContext } from "./AppLayout";

interface ContentPageProps {
  category: CategoryKey;
  tag?: string;
}

type SortKey = "newest" | "oldest" | "az";

const byNewest = (a: ContentItem, b: ContentItem) =>
  (b.createdAt ? Date.parse(b.createdAt) : b.id) - (a.createdAt ? Date.parse(a.createdAt) : a.id);

export default function ContentPage({ category, tag }: ContentPageProps) {
  const { openShare } = useOutletContext<LayoutContext>();
  const { items, loading, error, deleteItem, refresh, favorites, toggleFavorite } = useLibrary();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);

  const cat = CATEGORIES[category];

  // Everything in this section/tag, before search/favorites are applied.
  const inSection = useMemo(
    () => itemsInScope(items, { title: "", label: "", types: cat.types ?? undefined, tag }),
    [items, cat, tag]
  );

  const visible = useMemo(() => {
    const list = inSection.filter(
      (item) => matchesQuery(item, query) && (!onlyFavorites || favorites.has(item.id))
    );
    return list.sort(
      sort === "az"
        ? (a, b) => a.title.localeCompare(b.title)
        : sort === "oldest"
        ? (a, b) => -byNewest(a, b)
        : byNewest
    );
  }, [inSection, query, sort, onlyFavorites, favorites]);

  const controlClass = "rounded-md bg-white/90 px-3 py-2 text-sm text-gray-700 shadow-md";

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3 sm:pl-2">
        {tag && (
          <Link to="/tags" className="text-sm text-white/90 drop-shadow hover:text-cyan-300">
            ← All tags
          </Link>
        )}

        <label className={`flex min-w-0 flex-1 basis-48 items-center gap-2 sm:max-w-xs ${controlClass} focus-within:ring-2 focus-within:ring-purple-400`}>
          <SearchIcon className="size-4 shrink-0 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search title, description, tags..."
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-black" aria-label="Clear search">
              ✕
            </button>
          )}
        </label>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort"
          className={controlClass}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="az">A → Z</option>
        </select>

        <button
          onClick={() => setOnlyFavorites((v) => !v)}
          aria-pressed={onlyFavorites}
          className={`flex items-center gap-1 ${controlClass} ${onlyFavorites ? "!bg-amber-100 !text-amber-700" : ""}`}
        >
          <StarIcon className="size-4" filled={onlyFavorites} /> Favorites
        </button>

        {!loading && inSection.length > 0 && (
          <span className="text-sm text-white/80 drop-shadow">
            {visible.length} item{visible.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => void refresh()} className="font-medium underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-center text-white drop-shadow-md">Loading your content...</p>
      ) : visible.length > 0 ? (
  
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,16.5rem),1fr))]">
          {visible.map((item) => (
            <Card
              key={item.id}
              item={item}
              favorite={favorites.has(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onEdit={() => setEditing(item)}
              onShare={() => openShare({ title: item.title, label: item.title.slice(0, 40), ids: [item.id] })}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-white drop-shadow-md">
          {inSection.length > 0
            ? onlyFavorites && !query
              ? "No favorites here yet — tap the ★ on a card."
              : `Nothing matches “${query}”.`
            : tag
            ? `No items are tagged “${tag}”.`
            : cat.empty}
        </p>
      )}

      {editing && <EditModal item={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
