# Sign-in for Exec Assistant

Add real accounts so the workspace belongs to a signed-in executive instead of a demo persona. Email + password only, with stored profiles, and every existing page behind sign-in.

## What the user gets

1. **Public landing page at `/`** — a short premium intro (ink hero, value points: briefings, calendar, email, meeting notes) with "Sign in" and "Create account" calls to action. Replaces the current dashboard at `/`.
2. **`/auth` page** — one page with two tabs:
   - Sign in: email, password, inline error messages.
   - Create account: full name, job title, company, email, password. On submit it shows a "check your email to confirm" state.
   - Design matches the executive minimalist system (ink panel, single accent, no generic gradients).
3. **Forgot password** — link on the sign-in tab sends a reset email, plus a `/reset-password` page to choose a new password.
4. **Protected app** — Dashboard, Daily briefing, Calendar, Email assistant, Meeting notes, Task planner, Privacy & security and Settings all require sign-in. The signed-in home moves to `/dashboard`; visiting a protected page while signed out lands on `/auth`.
5. **Real identity in the UI** — sidebar, header greeting and Settings profile read the signed-in user's name, title, company and email instead of the hardcoded demo executive. Meetings, tasks and email demo content stays as sample data.
6. **Sign out** — from the sidebar profile area, clearing cached data and returning to `/auth`.

## Notes and trade-offs

- Enabling the backend is required for accounts; it adds the database, auth and secure server-side logic with no external accounts to set up.
- By default new accounts must confirm their email before they can sign in. If you'd rather sign-up log people straight in, say so and I'll switch that on.
- Google sign-in is not included per your choice; it can be added later without redoing this work.

## Technical outline

- Enable Lovable Cloud (Supabase-backed auth + Postgres).
- Migration: `public.profiles` (`id` FK to `auth.users` on delete cascade, `full_name`, `job_title`, `company`, `avatar_url`, timestamps), GRANTs for `authenticated` / `service_role`, RLS enabled with select/insert/update policies scoped to `auth.uid() = id`, plus a `handle_new_user` trigger on `auth.users` that inserts the profile from signup metadata.
- Routes:
  - `src/routes/index.tsx` → public marketing landing (own `head()` metadata).
  - `src/routes/auth.tsx` → public sign-in / sign-up tabs using `supabase.auth.signInWithPassword` and `signUp` with `emailRedirectTo: window.location.origin`.
  - `src/routes/reset-password.tsx` → public recovery page calling `supabase.auth.updateUser({ password })`.
  - `src/routes/_authenticated/route.tsx` → integration-managed gate (`ssr: false`, redirect to `/auth`).
  - Move `briefing`, `calendar`, `email`, `meetings`, `tasks`, `security`, `settings` under `_authenticated/`, and the current dashboard body to `_authenticated/dashboard.tsx`; update sidebar `Link`s and `createFileRoute` ids accordingly.
- Root route: single `supabase.auth.onAuthStateChange` subscriber filtered to `SIGNED_IN` / `SIGNED_OUT` / `USER_UPDATED` that invalidates the router and query cache.
- Profile read: `getMyProfile` server fn in `src/lib/profile.functions.ts` with `requireSupabaseAuth`, consumed by a `useProfile` hook; `app-shell` and `settings` fall back to email-derived initials while loading.
- Existing AI server functions keep working unchanged; `buildExecContext` takes the profile name/title when available.
