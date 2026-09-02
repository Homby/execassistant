import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckSquare,
  Mail,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";

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
  component: Landing,
});

const capabilities = [
  {
    icon: Sun,
    title: "Daily briefing",
    body: "One screen each morning: priorities, meetings, follow-ups owed and the risks worth your attention.",
  },
  {
    icon: CalendarDays,
    title: "Calendar triage",
    body: "Conflicts, prep gaps and protected focus blocks surfaced before they become fire drills.",
  },
  {
    icon: Mail,
    title: "Email drafting",
    body: "Board-ready replies in your tone — direct, diplomatic or warm — refined in a click.",
  },
  {
    icon: NotebookPen,
    title: "Meeting summaries",
    body: "Raw notes become decisions, owners and deadlines you can forward immediately.",
  },
  {
    icon: CheckSquare,
    title: "Task prioritisation",
    body: "A realistic plan for the day, including what to delegate and what to drop.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Nothing is processed until you ask, and every output is a draft you approve.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <span className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-ink text-ink-foreground">
            <Sparkles className="size-4 text-accent" />
          </span>
          <span className="text-sm font-semibold text-foreground">Exec Assistant</span>
        </span>
        <nav className="flex items-center gap-2">
          <Link
            to="/auth"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90"
          >
            Create account
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
          <div className="rounded-3xl bg-ink p-8 text-ink-foreground shadow-[var(--shadow-raised)] sm:p-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-foreground/60">
              AI chief of staff
            </p>
            <h1 className="display-serif mt-4 max-w-3xl text-3xl leading-tight sm:text-5xl">
              The administrative load of an executive week, handled before you sit down.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-foreground/70 sm:text-base">
              Exec Assistant reads your day — calendar, inbox and task list — and returns decisions
              instead of noise: a briefing, drafted replies, meeting follow-ups and a plan that fits
              the hours you actually have.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Create your workspace
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center rounded-full border border-ink-foreground/25 px-5 py-2.5 text-sm font-medium text-ink-foreground transition-colors hover:bg-ink-foreground/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <h2 className="text-lg font-semibold text-foreground">What it takes off your desk</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="size-4" />
                </span>
                <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
            <div>
              <p className="text-sm font-semibold text-foreground">Ready to reclaim the morning?</p>
              <p className="text-sm text-muted-foreground">
                Set up your workspace in under a minute.
              </p>
            </div>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90"
            >
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Exec Assistant · demo workspace with sample calendar and inbox data
      </footer>
    </div>
  );
}
