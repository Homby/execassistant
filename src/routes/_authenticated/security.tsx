import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Database, Eye, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { activityLog, execUser } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/security")({
  head: () => ({
    meta: [
      { title: "Privacy & security — Exec Assistant" },
      {
        name: "description",
        content:
          "See how executive data is handled: on-demand AI processing, session-scoped storage, access log and data controls.",
      },
      { property: "og:title", content: "Privacy & security — Exec Assistant" },
      {
        property: "og:description",
        content: "Transparency controls, access history and data handling for your executive workspace.",
      },
    ],
  }),
  component: SecurityPage,
});

const guarantees = [
  {
    icon: Lock,
    title: "Nothing processed until you ask",
    body: "Briefings, summaries and drafts are generated on demand. No background scanning of your calendar or inbox.",
  },
  {
    icon: Database,
    title: "Session-scoped by default",
    body: "Prototype data lives in your browser session. Connect a workspace later to control retention centrally.",
  },
  {
    icon: Eye,
    title: "You review before anything sends",
    body: "AI output is always a draft. Emails, replies and calendar changes require your explicit confirmation.",
  },
  {
    icon: KeyRound,
    title: "Least-privilege integrations",
    body: "Connectors request read-only scopes first; write access is opt-in per integration.",
  },
];

const controls = [
  { label: "Store AI drafts after session", value: "Off", detail: "Drafts are discarded when you sign out." },
  { label: "Use meeting notes to improve models", value: "Off", detail: "Your content is never used for training." },
  { label: "Two-factor authentication", value: "On", detail: "Authenticator app · enrolled" },
  { label: "Data region", value: execUser.timezone.split("/")[0], detail: "Processing kept in-region where possible." },
];

function SecurityPage() {
  return (
    <AppShell title="Privacy & security" subtitle="How your executive data is handled">
      <div className="space-y-6">
        <div className="rounded-2xl bg-ink p-6 text-ink-foreground shadow-[var(--shadow-raised)] sm:p-8">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-foreground/60">
            <ShieldCheck className="size-3.5 text-accent" />
            Trust posture
          </p>
          <p className="display-serif mt-3 max-w-2xl text-2xl leading-snug sm:text-3xl">
            Confidential by default. Your workspace is built so sensitive board, people and
            financial context never leaves your control.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {guarantees.map(({ icon: Icon, title, body }) => (
            <Panel key={title}>
              <div className="flex gap-4">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </div>
            </Panel>
          ))}
        </div>

        <Panel title="Data controls">
          <ul className="divide-y divide-border">
            {controls.map((c) => (
              <li key={c.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.detail}</p>
                </div>
                <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground">
                  {c.value}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Recent account activity"
          action={
            <Button variant="outline" size="sm" className="rounded-full">
              Export log
            </Button>
          }
        >
          <ul className="space-y-4">
            {activityLog.map((a) => (
              <li key={a.id} className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.detail} · {a.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Data requests">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-full">
              Download my data
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              Clear AI history
            </Button>
            <Button variant="outline" size="sm" className="rounded-full text-destructive">
              Delete workspace
            </Button>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-accent" />
            This prototype simulates these controls so you can review the intended behaviour before
            connecting real accounts.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
