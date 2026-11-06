import { useState } from "react";
import { useLibrary } from "../lib/library";
import type { ContentItem } from "../lib/content";

export default function EditModal({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  const { updateItem } = useLibrary();
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || "");
  const [tags, setTags] = useState(item.tags || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title can't be empty.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateItem(item.id, { title, description, tags });
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.status === 404
          ? "Couldn't save — the backend may need the updated version (PATCH /content/:id)."
          : "Couldn't save your changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const field = "w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-md"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-h-[92vh] w-[92%] max-w-md overflow-y-auto rounded-2xl bg-white p-5 text-black shadow-2xl sm:p-6">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 hover:text-black" aria-label="Close">
          ✕
        </button>
        <h2 className="mb-4 text-center text-2xl font-bold">Edit item</h2>

        <form onSubmit={save} className="flex flex-col gap-3">
          <label className="text-sm text-gray-500">
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={`${field} mt-1 text-black`} />
          </label>
          <label className="text-sm text-gray-500">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${field} mt-1 resize-none text-black`}
            />
          </label>
          <label className="text-sm text-gray-500">
            Tags (comma separated)
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={`${field} mt-1 text-black`} />
          </label>
          <p className="truncate text-xs text-gray-400" title={item.link}>Link: {item.link}</p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
