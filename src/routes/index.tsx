import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckSquare,
  Clock,
  Mail,
  NotebookPen,
  Sparkles,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AskAssistantPanel } from "@/components/ask-assistant";
import { Panel, SectionLabel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { communications, priorityLabel, tasks, todaysMeetings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Exec Assistant — AI chief of staff for senior leaders" },
      {
        name: "description",
        content:
          "An AI executive productivity hub: daily briefings, calendar triage, email drafting, meeting summaries and ruthless task prioritisation.",
      },
      { property: "og:title", content: "Exec Assistant — AI chief of staff" },
      {
        property: "og:description",
        content:
          "Reduce administrative load and decide faster with AI briefings, email drafting, meeting summaries and task prioritisation.",
      },
    ],
  }),
  component: Dashboard,
});

const priorityTone: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-warning/15 text-warning-foreground",
  medium: "bg-accent/10 text-accent",
  low: "bg-muted text-muted-foreground",
};

function Dashboard() {
  const openTasks = tasks.filter((t) => !t.done);
  const overdue = openTasks.filter((t) => t.overdue).length;
  const meetingMinutes = todaysMeetings.reduce((n, m) => n + m.durationMin, 0);
  const prepMinutes = todaysMeetings.reduce((n, m) => n + (m.prepReady ? 0 : m.prepMinutes), 0);
  const important = communications.filter((c) => c.important);

  const stats = [
    { label: "Meetings today", value: String(todaysMeetings.length), hint: `${meetingMinutes} min booked`, icon: CalendarDays },
    { label: "Open tasks", value: String(openTasks.length), hint: `${overdue} overdue`, icon: CheckSquare },
    { label: "Prep outstanding", value: `${prepMinutes}m`, hint: "Before your next call", icon: Clock },
    { label: "Needs a reply", value: String(important.length), hint: "Flagged as important", icon: Mail },
  ];

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, hint, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between">
                <p className="label-caps mb-0">{label}</p>
                <Icon className="size-4 text-accent" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-ink p-6 text-ink-foreground shadow-[var(--shadow-raised)] sm:p-8">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-foreground/60">
            <Sparkles className="size-3.5 text-accent" />
            Today at a glance
          </p>
          <p className="display-serif mt-3 max-w-2xl text-2xl leading-snug sm:text-3xl">
            {overdue > 0
              ? `Clear ${overdue} overdue item${overdue > 1 ? "s" : ""} before the ${todaysMeetings[0]?.title ?? "first meeting"}.`
              : "Your day is under control — protect the board prep block."}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-foreground/70">
            {todaysMeetings.length} meetings, {meetingMinutes} minutes booked, {prepMinutes} minutes
            of preparation still outstanding.
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
              <Link to="/calendar">Open calendar</Link>
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
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {todaysMeetings.map((m) => (
                <li key={m.id} className="flex gap-4 px-5 py-4">
                  <div className="w-14 shrink-0 text-right">
                    <p className="text-sm font-semibold text-foreground">{m.start}</p>
                    <p className="text-[11px] text-muted-foreground">{m.durationMin}m</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{m.location}</p>
                    {m.attendees.length > 0 && (
                      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Users className="size-3" />
                        {m.attendees.join(", ")}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.conflict && (
                        <Badge variant="destructive" className="gap-1 text-[10px]">
                          <AlertTriangle className="size-3" />
                          Conflict
                        </Badge>
                      )}
                      {!m.prepReady && m.prepMinutes > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {m.prepMinutes}m prep needed
                        </Badge>
                      )}
                      {m.prepReady && (
                        <Badge variant="outline" className="text-[10px]">
                          Prep ready
                        </Badge>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Priority tasks"
            action={
              <Link to="/tasks" className="text-xs font-medium text-accent hover:underline">
                Plan day
              </Link>
            }
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {openTasks.slice(0, 5).map((t) => (
                <li key={t.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-snug text-foreground">{t.title}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold",
                        priorityTone[t.priority],
                      )}
                    >
                      {priorityLabel[t.priority]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.due} · {t.project} · ~{t.effortMin}m
                  </p>
                </li>
              ))}
            </ul>
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
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {communications.map((c) => (
                <li key={c.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-foreground">{c.from}</p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {c.channel}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-foreground/80">{c.subject}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.preview}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">{c.received}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="space-y-6">
            <Panel title="Ask your assistant">
              <AskAssistantPanel compact />
            </Panel>
            <Panel title="Quick actions" bodyClassName="p-4">
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
