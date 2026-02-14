"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  created_at: string;
};

type BookmarkManagerProps = {
  userId: string;
};

export function BookmarkManager({ userId }: BookmarkManagerProps) {
  const supabase = useMemo(() => createClient(), []);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadBookmarks = useCallback(async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("id,title,url,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage("Could not load bookmarks.");
      return;
    }

    setBookmarks(data ?? []);
  }, [supabase]);

  useEffect(() => {
    void loadBookmarks();

    const channel = supabase
      .channel(`bookmarks-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`
        },
        () => {
          void loadBookmarks();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadBookmarks, supabase, userId]);

  async function addBookmark(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim() || !url.trim()) {
      setErrorMessage("Title and URL are required.");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from("bookmarks").insert({
      user_id: userId,
      title: title.trim(),
      url: url.trim()
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage("Could not add bookmark.");
      return;
    }

    setTitle("");
    setUrl("");
  }

  async function deleteBookmark(id: string) {
    setErrorMessage("");
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      setErrorMessage("Could not delete bookmark.");
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <form onSubmit={addBookmark} className="mb-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
        >
          {isSaving ? "Adding..." : "Add"}
        </button>
      </form>

      {errorMessage ? <p className="mb-3 text-sm text-red-600">{errorMessage}</p> : null}

      <ul className="space-y-2">
        {bookmarks.length === 0 ? (
          <li className="rounded-md border border-dashed border-zinc-300 p-4 text-zinc-500">No bookmarks yet.</li>
        ) : (
          bookmarks.map((bookmark) => (
            <li key={bookmark.id} className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 p-3">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate text-emerald-700 hover:underline"
              >
                {bookmark.title}
              </a>
              <button
                type="button"
                onClick={() => deleteBookmark(bookmark.id)}
                className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
