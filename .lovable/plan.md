# What's missing, and what I'd add next

Right now sign-in, your profile, photo, assistant personalisation and calendar linking are real and saved. The four AI tools work, but nothing they produce is kept — close the page and it's gone. That's the biggest gap.

## 1. Make the work stick (highest value)

Give each executive their own private saved records for:

- **Tasks** — add, tick off, set priority, deadline, who it's delegated to. The planner then reorders real tasks instead of a throwaway list.
- **Meeting notes** — save each summary with its decisions and action items, and a history you can search. Action items can be pushed into tasks in one click.
- **Email drafts** — keep drafts and sent-marked messages instead of losing them on refresh.
- **Briefings** — store each morning's briefing so you can look back at the week.

Once these exist, the dashboard stops showing dashes: meetings today, open tasks, prep outstanding and items needing a reply all count real records.

## 2. Real calendar events

Today a linked calendar is a saved connection, not actual meetings. Add your own meetings (title, time, attendees, location, prep time) so the day view, conflict warnings and briefings work. A genuine two-way Google/Outlook sync is a bigger piece of work — worth doing after the above, and I'd flag it as its own project.

## 3. Smaller improvements worth having

- **Search** across tasks, notes and drafts from the top bar.
- **Delegation view** — everything currently sitting with someone else, in one list.
- **Weekly review** — a Friday summary: what shipped, what slipped, what's next week.
- **Export** — download a meeting summary or briefing as a document to forward.
- **Dark mode** and a proper mobile layout pass.
- **Keyboard shortcuts** for the four tools.
- **Sign-in with Google** alongside email and password.
- **Account safety** — change password from settings, and delete-my-data.
- **Email confirmation polish** — clearer messaging when a new account needs to confirm.

## Suggested order

1. Tasks saved for real + dashboard counts
2. Meeting notes history + action items into tasks
3. Saved email drafts
4. Own calendar events + day view and conflicts
5. Briefing history and weekly review
6. Search, export, dark mode, shortcuts, account safety

## Technical notes

New per-user tables (`tasks`, `meeting_notes`, `action_items`, `email_drafts`, `briefings`, `calendar_events`) in Lovable Cloud, each with row-level security scoped to `auth.uid()` and explicit grants, following the existing `assistant_preferences` pattern. Reads and writes go through typed server functions in `src/lib/*.functions.ts` with `requireSupabaseAuth`, exposed via hooks under `src/hooks/`, and consumed by the existing `_authenticated` routes. `buildExecContext` in `src/lib/exec-context.ts` switches from `mock-data.ts` to the real rows so every AI prompt reflects the executive's actual day.
