import type { SharedItem, SharedPayload } from "./content";

const MAX_ENCODED_LENGTH = 6000;

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(data: string): string {
  const b64 = data.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodeSnapshot(owner: string, label: string, items: SharedItem[]): string | null {
  const slim = items.map(({ title, link, description, tags, type, createdAt }) => ({
    t: title, l: link, d: description, g: tags, y: type, c: createdAt,
  }));
  const encoded = toBase64Url(JSON.stringify({ o: owner, n: label, i: slim }));
  return encoded.length > MAX_ENCODED_LENGTH ? null : encoded;
}

export function decodeSnapshot(hash: string): SharedPayload | null {
  try {
    const raw = JSON.parse(fromBase64Url(hash.replace(/^#/, "")));
    if (!raw || !Array.isArray(raw.i)) return null;
    return {
      owner: String(raw.o || "Someone"),
      label: String(raw.n || ""),
      expiresAt: null,
      snapshot: true,
      contents: raw.i.map((x: any, idx: number) => ({
        id: idx,
        title: String(x.t || "Untitled"),
        link: String(x.l || ""),
        description: String(x.d || ""),
        tags: String(x.g || ""),
        type: String(x.y || "url"),
        createdAt: x.c,
      })),
    };
  } catch {
    return null;
  }
}
