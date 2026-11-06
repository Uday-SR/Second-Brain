import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { aiService, backend, getStoredUser, setStoredUser } from "./api";
import { AI_TYPES, parseTags, type ContentItem, type UserProfile } from "./content";

export interface TagInfo {
  key: string; 
  label: string; 
  count: number;
}

interface LibraryValue {
  items: ContentItem[];
  loading: boolean;
  error: string;
  user: UserProfile | null;
  tags: TagInfo[];
  refresh: () => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  updateItem: (id: number, patch: { title: string; description: string; tags: string }) => Promise<void>;
  favorites: Set<number>;
  toggleFavorite: (id: number) => void;
}

const FAV_KEY = "remind:favorites";

function loadFavorites(): Set<number> {
  try {
    const raw = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    return new Set(Array.isArray(raw) ? raw.filter((n) => typeof n === "number") : []);
  } catch {
    return new Set();
  }
}

const LibraryContext = createContext<LibraryValue | null>(null);

function persistFavorites(set: Set<number>) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
  } catch {
    
  }
}

const isUnfinished = (i: ContentItem) =>
  AI_TYPES.has(i.type) && (i.status === "PENDING" || i.status === "PROCESSING");

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [user, setUser] = useState<UserProfile | null>(() => {
    const cached = getStoredUser();
    return cached ? { id: cached.id ?? 0, username: cached.username, email: cached.email } : null;
  });
  const [favorites, setFavorites] = useState<Set<number>>(loadFavorites);

  const itemsRef = useRef<ContentItem[]>([]);
  const syncing = useRef(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const syncStatuses = useCallback(async (list: ContentItem[]) => {
    const unfinished = list.filter(isUnfinished);
    if (unfinished.length === 0 || syncing.current) return;
    syncing.current = true;

    try {
      const results = await Promise.all(
        unfinished.map(async (item) => {
          try {
            const res = await aiService.get(`/content/${item.id}/status`);
            const next = String(res.data.status || "").toUpperCase();
            if (!next || next === item.status) return null;

            const error: string | null = res.data.error ?? null;
            await backend
              .patch(`/content/${item.id}/status`, {
                status: next,
                error,
                contentHash: res.data.content_hash ?? undefined,
              })
              .catch(() => undefined);
            return { id: item.id, status: next, error };
          } catch {
            return null; 
          }
        })
      );

      const changes = results.filter((r): r is { id: number; status: string; error: string | null } => r !== null);
      if (changes.length > 0) {
        setItems((prev) =>
          prev.map((it) => {
            const c = changes.find((x) => x.id === it.id);
            return c ? { ...it, status: c.status, error: c.error } : it;
          })
        );
      }
    } finally {
      syncing.current = false;
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await backend.get<ContentItem[]>("/content/contents");
      const list = res.data || [];
      setItems(list);
      setError("");
      void syncStatuses(list);
    } catch (e) {
      console.log("Error fetching content", e);
      setError("Couldn't load your content. Check that the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  }, [syncStatuses]);

  useEffect(() => {
    void refresh();

    backend
      .get<UserProfile>("/user/me")
      .then((res) => {
        setUser(res.data);
        setStoredUser(res.data);
      })
      .catch(() => undefined); 
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void syncStatuses(itemsRef.current);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [syncStatuses]);

  const deleteItem = useCallback(async (id: number) => {
    await backend.delete(`/content/${id}`); 
    setItems((prev) => prev.filter((i) => i.id !== id));
    setFavorites((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      persistFavorites(next);
      return next;
    });
    
    aiService.delete(`/content/${id}`).catch(() => undefined);
  }, []);

  const updateItem = useCallback(
    async (id: number, patch: { title: string; description: string; tags: string }) => {
      await backend.patch(`/content/${id}`, patch);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch, title: patch.title.trim() } : i)));
    },
    []
  );

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persistFavorites(next);
      return next;
    });
  }, []);

  const tags = useMemo(() => {
    const map = new Map<string, TagInfo>();
    for (const item of items) {
      const seen = new Set<string>();
      for (const label of parseTags(item.tags)) {
        const key = label.toLowerCase();
        if (seen.has(key)) continue; 
        seen.add(key);
        const existing = map.get(key);
        if (existing) existing.count += 1;
        else map.set(key, { key, label, count: 1 });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [items]);

  const value = useMemo(
    () => ({ items, loading, error, user, tags, refresh, deleteItem, updateItem, favorites, toggleFavorite }),
    [items, loading, error, user, tags, refresh, deleteItem, updateItem, favorites, toggleFavorite]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
}
