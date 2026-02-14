# Smart Bookmark App

A production-style full-stack assignment I built with **Next.js App Router + Supabase + Tailwind**, focused on secure auth, private user data, and real-time UX.

## Live Project
- Live URL: `https://smart-bookmark-app-h1f9.vercel.app/`
- GitHub: `https://github.com/shivamsingh190103/SmartBookmarkApp`

## What I Built
- Google OAuth only sign-in (no email/password)
- Add bookmark (`title + url`)
- User-private bookmarks using Supabase RLS
- Real-time sync across tabs using Supabase Realtime
- Delete own bookmarks
- Deployment-ready on Vercel

## Tech Stack
- Next.js (App Router), TypeScript
- React
- Supabase (Auth, Postgres, Realtime, RLS)
- Tailwind CSS
- Vercel

## My First-Principles Approach
I broke the problem into system guarantees instead of just features:

1. **Identity guarantee**: only real authenticated users can act.
2. **Data isolation guarantee**: user A must never read/write user B data.
3. **Consistency guarantee**: UI must reflect DB changes immediately across tabs.
4. **Deployment guarantee**: OAuth and callback flow must work in local + production.

Then I implemented each guarantee in the backend first (auth/session, RLS policies, realtime publication), and only then completed UI behavior.

## Real Problems I Faced and How I Solved Them

### 1) OAuth failed with provider/config errors
**What happened:** Google sign-in failed at different stages (`provider not enabled`, then `redirect_uri_mismatch`).

**How I debugged:**
- Verified flow from `/auth/login` -> Google consent -> `/auth/callback`.
- Checked generated `redirectTo` value against Supabase + Google Console settings.
- Compared local origin vs deployed origin.

**Fix:**
- Enabled Google provider in Supabase Auth.
- Added correct Google Client ID/Secret.
- Whitelisted exact callback URLs in Google Cloud and Supabase.

**Takeaway:** OAuth failures are mostly configuration invariants, not code bugs.

### 2) Session state was inconsistent across navigation
**What happened:** User state was not always stable unless I handled cookies correctly in server context.

**How I debugged:**
- Validated auth/session behavior in middleware and server components.
- Confirmed when cookie writes are allowed and when they are no-op.

**Fix:**
- Used `@supabase/ssr` server/browser clients.
- Added middleware session refresh flow.
- Kept callback route responsible for `exchangeCodeForSession`.

**Takeaway:** In App Router, auth reliability depends on consistent server-cookie handling.

### 3) Privacy requirement (RLS) was the highest-risk area
**What happened:** Without strict policies, data isolation is not guaranteed.

**How I debugged:**
- Treated frontend filtering as non-security.
- Verified security at SQL policy level only.

**Fix:**
- Enabled RLS on `public.bookmarks`.
- Added explicit policies for select/insert/delete with `auth.uid() = user_id`.

**Takeaway:** Security boundaries must be enforced in database policies, not just UI logic.

### 4) Real-time updates were not enough with just DB writes
**What happened:** I needed true cross-tab sync without refresh.

**How I debugged:**
- Tested in two tabs with same account.
- Observed event subscription behavior and scope.

**Fix:**
- Subscribed to `postgres_changes` on `bookmarks` filtered by current `user_id`.
- Reloaded bookmark list on each insert/delete event.
- Ensured table is added to `supabase_realtime` publication.

**Takeaway:** Realtime = publication + channel subscription + predictable state refresh.

## How I Used Codex, ChatGPT, and Cursor Effectively
I used AI tools as force multipliers, not as autopilot:

### Codex (execution + repo-grounded changes)
- Used Codex to inspect project files quickly, patch routes/policies/UI, and keep changes consistent with current codebase structure.
- Used it to reduce mechanical overhead (file edits, refactors, verification steps) so I could focus on architecture decisions.

### ChatGPT (reasoning + edge-case review)
- Used ChatGPT to pressure-test my approach: OAuth flow assumptions, RLS policy logic, and failure-mode handling.
- Used it for alternative solution comparisons before making final implementation decisions.

### Cursor (fast iteration in editor)
- Used Cursor for rapid in-file iteration, especially UI improvements and TypeScript cleanup.
- Used it to speed up small changes while preserving manual review before accepting edits.

### My AI workflow discipline
- I never shipped unverified AI output directly.
- I validated each important claim against running behavior (auth, policies, realtime).
- I treated AI suggestions as hypotheses, then confirmed with tests and app behavior.

## Architecture Notes
- `src/app/auth/login/route.ts`: starts Google OAuth and redirects.
- `src/app/auth/callback/route.ts`: exchanges auth code for session.
- `middleware.ts`: refreshes/propagates auth cookies for stable sessions.
- `supabase/schema.sql`: table, RLS policies, realtime publication.
- `src/components/bookmark-manager.tsx`: CRUD UI + realtime subscription.

## Local Setup
1. Install dependencies:
```bash
npm install
```
2. Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
3. Apply `supabase/schema.sql` in Supabase SQL editor.
4. Configure Google OAuth in Supabase + Google Cloud with correct callback URLs.
5. Run:
```bash
npm run dev
```

## What I’d Improve Next
- Add URL validation + duplicate prevention.
- Add optimistic UI and loading skeletons.
- Add integration tests for auth callback and policy-protected queries.
- Add monitoring/alerts for auth failures in production.

## Why This Project Reflects My Fit
This project shows how I work as a junior engineer in real conditions: clear problem decomposition, strong fundamentals (auth/security/data consistency), practical use of AI tools, and disciplined validation before shipping.
