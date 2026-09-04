import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CalendarDays,
  CheckSquare,
  Clock,
  Mail,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AskAssistantPanel } from "@/components/ask-assistant";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { useCalendarConnections } from "@/hooks/use-assistant";
import { useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Exec Assistant" },
      {
        name: "description",
        content:
          "Your executive command centre: schedule load, priority tasks, communications needing a reply and AI briefings — all in one clean view.",
      },
      { property: "og:title", content: "Dashboard — Exec Assistant" },
      {
        property: "og:description",
        content:
          "A clean executive command centre for schedule, tasks, communications and AI briefings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const stats = [
  {
    label: "Meetings today",
    icon: CalendarDays,
    hint: "Counts the meetings on your linked calendar for today, so you can see the day's load at a glance.",
  },
  {
    label: "Open tasks",
    icon: CheckSquare,
    hint: "Everything still owed by you or your team, with overdue items surfaced first.",
  },
  {
    label: "Prep outstanding",
    icon: Clock,
    hint: "Preparation time your assistant estimates you still need before your next commitments.",
  },
  {
    label: "Needs a reply",
    icon: Mail,
    hint: "Messages flagged as important that are waiting on a decision or response from you.",
  },
];

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border p-4 text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

function Dashboard() {
  const { data: profile } = useProfile();
  const { data: calendars } = useCalendarConnections();
  const firstName = (profile?.fullName ?? "there").split(" ")[0];
  const hasCalendar = (calendars?.length ?? 0) > 0;

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, hint, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between">
                <p className="label-caps mb-0">{label}</p>
                <Icon className="size-4 text-accent" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-muted-foreground/50">—</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-ink p-6 text-ink-foreground shadow-[var(--shadow-raised)] sm:p-8">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-foreground/60">
            <Sparkles className="size-3.5 text-accent" />
            Today at a glance
          </p>
          <p className="display-serif mt-3 max-w-2xl text-2xl leading-snug sm:text-3xl">
            Welcome, {firstName}. Your workspace is empty and private.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-foreground/70">
            {hasCalendar
              ? "Your calendar is linked. Generate a briefing to have your assistant read the day and tell you what matters."
              : "Link a calendar and add your first tasks — your assistant then fills this space with your real schedule, priorities and decisions to make."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm" className="rounded-full">
              <Link to="/briefing">
                Generate full briefing
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full text-ink-foreground hover:bg-ink-soft"
            >
              <Link to={hasCalendar ? "/calendar" : "/profile"}>
                {hasCalendar ? "Open calendar" : "Link a calendar"}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel
            className="lg:col-span-2"
            title="Today's schedule"
            action={
              <Link to="/calendar" className="text-xs font-medium text-accent hover:underline">
                Full calendar
              </Link>
            }
          >
            <EmptyNote>
              This is your timeline for the day, drawn from your linked calendars. Once connected it
              shows each meeting with attendees, location, double bookings and how much preparation
              time your assistant is protecting for you.
            </EmptyNote>
          </Panel>

          <Panel
            title="Priority tasks"
            action={
              <Link to="/tasks" className="text-xs font-medium text-accent hover:underline">
                Plan day
              </Link>
            }
          >
            <EmptyNote>
              Your shortlist of what genuinely needs you today, ranked by impact and deadline. Add
              tasks in the planner and your assistant will order them and suggest what to delegate.
            </EmptyNote>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title="Needs your attention"
            action={
              <Link to="/email" className="text-xs font-medium text-accent hover:underline">
                Draft reply
              </Link>
            }
          >
            <EmptyNote>
              Communications waiting on a decision from you — the few messages worth your time,
              summarised so you can approve, reply or delegate in seconds.
            </EmptyNote>
          </Panel>

          <div className="space-y-6">
            <Panel title="Ask your assistant">
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                A private line to your AI chief of staff. Ask about your day, draft a message, or
                think through a decision — nothing is stored or shared without your action.
              </p>
              <AskAssistantPanel compact />
            </Panel>
            <Panel title="Quick actions" bodyClassName="p-4">
              <p className="mb-3 px-1 text-sm leading-relaxed text-muted-foreground">
                Shortcuts into the four tools you will use most.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { to: "/email", label: "Write an email", icon: Mail },
                  { to: "/meetings", label: "Summarise notes", icon: NotebookPen },
                  { to: "/tasks", label: "Prioritise tasks", icon: CheckSquare },
                  { to: "/briefing", label: "Daily briefing", icon: Sparkles },
                ].map(({ to, label, icon: Icon }) => (
                  <Button
                    key={to}
                    asChild
                    variant="outline"
                    className="h-auto justify-start rounded-xl py-3"
                  >
                    <Link to={to}>
                      <Icon className="size-4 text-accent" />
                      {label}
                    </Link>
                  </Button>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
