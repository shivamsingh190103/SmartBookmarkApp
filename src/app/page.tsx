import { BookmarkManager } from "@/components/bookmark-manager";
import { createClient } from "@/lib/supabase/server";
import { AuthError } from "./auth-error";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen p-6 md:p-12">
      <AuthError error={error} />
      <div className="mx-auto mb-8 flex w-full max-w-2xl items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Bookmark App</h1>
          <p className="text-sm text-zinc-600">Private bookmarks with realtime sync.</p>
        </div>

        {user ? (
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100"
            >
              Sign out
            </button>
          </form>
        ) : null}
      </div>

      {user ? (
        <BookmarkManager userId={user.id} />
      ) : (
        <section className="mx-auto w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-zinc-700">Use Google OAuth to sign in.</p>
          <a
            href="/auth/login"
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
          >
            Continue with Google
          </a>
        </section>
      )}
    </main>
  );
}
