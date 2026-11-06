export interface ContentItem {
  id: number;
  title: string;
  link: string;
  tags: string;
  userId: number;
  description: string;
  type: string;
  status?: string; 
  error?: string | null;
  createdAt?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
}

export const AI_TYPES = new Set(["youtube", "article", "url", "pdf", "markdown", "text"]);

export const TYPE_LABELS: Record<string, string> = {
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

export type CategoryKey = "all" | "tweets" | "videos" | "documents" | "links";

export interface Category {
  key: CategoryKey;
  title: string;
  path: string;
  types: string[] | null; 
  empty: string;
}

export const CATEGORIES: Record<CategoryKey, Category> = {
  all: {
    key: "all",
    title: "All content",
    path: "/home",
    types: null,
    empty: 'No content available. Click "Add" to get started!',
  },
  tweets: {
    key: "tweets",
    title: "Tweets",
    path: "/tweets",
    types: ["twitter"],
    empty: 'No tweets saved yet. Click "Add" and paste a Twitter / X link.',
  },
  videos: {
    key: "videos",
    title: "Videos",
    path: "/videos",
    types: ["youtube"],
    empty: 'No videos saved yet. Click "Add" and paste a YouTube link.',
  },
  documents: {
    key: "documents",
    title: "Documents",
    path: "/documents",
    types: ["pdf", "markdown", "text", "image", "audio"],
    empty: 'No documents saved yet. Click "Add" and upload a PDF, Markdown or text file.',
  },
  links: {
    key: "links",
    title: "Links",
    path: "/links",
    types: ["article", "url", "github"],
    empty: 'No links saved yet. Click "Add" and paste an article or GitHub link.',
  },
};

export function parseTags(tags: string | null | undefined): string[] {
  return (tags || "")
    .split(/[,#]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function matchesQuery(item: ContentItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.title, item.description, item.tags, item.link]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function isUploadLink(link: string): boolean {
  return link.startsWith("upload://");
}

export function youtubeEmbedUrl(link: string): string {
  try {
    const url = new URL(link);
    const host = url.hostname.replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/") || url.pathname.startsWith("/live/"))
      id = url.pathname.split("/")[2] || "";
    else id = url.searchParams.get("v") || "";
    return id ? `https://www.youtube.com/embed/${id}` : link;
  } catch {
    return link;
  }
}

export function youtubeThumbnail(link: string): string | null {
  const embed = youtubeEmbedUrl(link);
  const id = embed.startsWith("https://www.youtube.com/embed/") ? embed.split("/embed/")[1] : "";
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export interface Scope {
  title: string;
  label: string; 
  types?: string[];
  tag?: string;
  ids?: number[]; 
}

export function itemsInScope(items: ContentItem[], scope: Scope | null): ContentItem[] {
  if (!scope) return items;
  return items.filter((i) => {
    if (scope.ids && !scope.ids.includes(i.id)) return false;
    if (scope.types && !scope.types.includes(i.type)) return false;
    if (scope.tag && !parseTags(i.tags).some((t) => t.toLowerCase() === scope.tag!.toLowerCase())) return false;
    return true;
  });
}

export function hostOf(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export interface SharedItem {
  id: number;
  title: string;
  link: string;
  description: string;
  tags: string;
  type: string;
  createdAt?: string;
}

export interface SharedPayload {
  owner: string;
  label: string;
  expiresAt: number | null;
  contents: SharedItem[];
  snapshot?: boolean;
}

export function scopeFromPath(pathname: string): Scope {
  const clean = pathname.replace(/\/+$/, "") || "/";

  for (const cat of Object.values(CATEGORIES)) {
    if (cat.path === clean && cat.types) {
      return { title: cat.title, label: cat.title, types: cat.types };
    }
  }

  if (clean.startsWith("/tags/")) {
    let tag = clean.slice("/tags/".length);
    try {
      tag = decodeURIComponent(tag);
    } catch {
      
    }
    return { title: `#${tag}`, label: `#${tag}`, tag };
  }

  const titles: Record<string, string> = {
    "/home": "All content",
    "/tags": "Tags",
    "/profile": "Profile",
    "/settings": "Settings",
    "/help": "Help",
  };
  return { title: titles[clean] || "ReMind", label: "Everything" };
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
