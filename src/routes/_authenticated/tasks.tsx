import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Clock, ListChecks, Loader2, UserPlus, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { AiOutputActions } from "@/components/ai-output-actions";
import { AppShell } from "@/components/app-shell";
import { BulletList, EmptyState, Panel, SectionLabel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { planTasks } from "@/lib/ai.functions";
import { buildExecContext } from "@/lib/exec-context";
import { priorityLabel, tasks as seedTasks, type Priority } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "AI task planner and prioritisation — Exec Assistant" },
      {
        name: "description",
        content:
          "Prioritise executive workload by urgency and impact, estimate effort, spot delegation candidates and get a recommended schedule.",
      },
      { property: "og:title", content: "AI task planner — Exec Assistant" },
      {
        property: "og:description",
        content: "Ruthless prioritisation, effort estimates and delegation suggestions.",
      },
    ],
  }),
  component: TasksPage,
});

const priorityTone: Record<Priority, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/25",
  high: "bg-warning/10 text-warning-foreground border-warning/30",
  medium: "bg-accent/10 text-accent border-accent/25",
  low: "bg-muted text-muted-foreground border-border",
};

function TasksPage() {
  const fn = useServerFn(planTasks);
  const [items, setItems] = useState(seedTasks);
  const [goal, setGoal] = useState("");

  const plan = useMutation({
    mutationFn: () => fn({ data: { goal, ctx: buildExecContext() } }),
    onError: () => toast.error("Planning failed. Try again."),
  });

  const toggle = (id: string) =>
    setItems((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const open = items.filter((t) => !t.done);
  const totalEffort = open.reduce((n, t) => n + t.effortMin, 0);
  const p = plan.data;
  const copyText = p
    ? [
        p.overview,
        p.tasks.length
          ? `\nTasks:\n${p.tasks
              .map((t) => `- ${t.title} [${t.priority}] ${t.effort}, due ${t.deadline}`)
              .join("\n")}`
          : "",
        p.schedule.length
          ? `\nSchedule:\n${p.schedule.map((s) => `- ${s.slot}: ${s.focus}`).join("\n")}`
          : "",
        p.bottlenecks.length ? `\nBottlenecks:\n- ${p.bottlenecks.join("\n- ")}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return (
    <AppShell title="Task planner" subtitle="Prioritised by urgency, impact and available time">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Open tasks", value: String(open.length), icon: ListChecks },
            {
              label: "Estimated effort",
              value: `${Math.floor(totalEffort / 60)}h ${totalEffort % 60}m`,
              icon: Clock,
            },
            {
              label: "Delegation candidates",
              value: String(open.filter((t) => t.delegateTo).length),
              icon: UserPlus,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between">
                <p className="label-caps mb-0">{label}</p>
                <Icon className="size-4 text-accent" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <Panel title="Your task list" bodyClassName="space-y-2">
            {items.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "flex gap-3 rounded-xl border border-border p-4",
                  t.done && "opacity-55",
                )}
              >
                <Checkbox
                  checked={t.done}
                  onCheckedChange={() => toggle(t.id)}
                  aria-label={`Mark ${t.title} complete`}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium text-foreground",
                      t.done && "line-through",
                    )}
                  >
                    {t.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.detail}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className={cn("text-[10px]", priorityTone[t.priority])}>
                      {priorityLabel[t.priority]}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {t.due}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {t.project}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      ~{t.effortMin}m
                    </Badge>
                    {t.overdue && !t.done && (
                      <Badge variant="destructive" className="text-[10px]">
                        Overdue
                      </Badge>
                    )}
                    {t.delegateTo && (
                      <Badge variant="outline" className="text-[10px]">
                        Delegate → {t.delegateTo}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Panel>

          <div className="space-y-6">
            <Panel title="Plan with AI" bodyClassName="space-y-4">
              <Textarea
                rows={5}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Get the board pack finalised, close the hiring decision and unblock the Nordics pilot this week."
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => plan.mutate()} disabled={!goal.trim() || plan.isPending}>
                  {plan.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Wand2 className="size-4" />
                  )}
                  Build plan
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setGoal(
                      open
                        .map((t) => `${t.title} (${priorityLabel[t.priority]}, due ${t.due})`)
                        .join("\n"),
                    )
                  }
                >
                  Use my open tasks
                </Button>
              </div>
              <AiDisclaimer />
            </Panel>

            <Panel title="Recommended plan" bodyClassName="space-y-5">
              {!p && !plan.isPending && (
                <EmptyState
                  title="No plan yet"
                  hint="Describe your objective and Exec Assistant will prioritise, estimate effort and suggest what to delegate."
                />
              )}
              {plan.isPending && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Prioritising your workload…
                </div>
              )}
              {p && (
                <>
                  {p.overview && (
                    <p className="text-sm leading-relaxed text-foreground">{p.overview}</p>
                  )}
                  {p.tasks.length > 0 && (
                    <ul className="space-y-2">
                      {p.tasks.map((t, i) => (
                        <li key={i} className="rounded-xl border border-border p-3">
                          <p className="text-sm font-medium text-foreground">{t.title}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Badge variant="secondary" className="text-[10px]">
                              {t.priority}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {t.effort}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {t.deadline}
                            </Badge>
                            {t.project && (
                              <Badge variant="outline" className="text-[10px]">
                                {t.project}
                              </Badge>
                            )}
                            {t.delegateTo && (
                              <Badge variant="outline" className="text-[10px]">
                                Delegate → {t.delegateTo}
                              </Badge>
                            )}
                          </div>
                          {t.dependsOn && (
                            <p className="mt-2 text-[11px] text-muted-foreground">
                              Depends on: {t.dependsOn}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {p.schedule.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <SectionLabel>Suggested schedule</SectionLabel>
                      <ul className="space-y-2">
                        {p.schedule.map((s, i) => (
                          <li key={i} className="flex gap-3 text-sm">
                            <span className="w-28 shrink-0 font-medium text-foreground">
                              {s.slot}
                            </span>
                            <span className="text-muted-foreground">{s.focus}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {p.bottlenecks.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <SectionLabel>Bottlenecks</SectionLabel>
                      <BulletList items={p.bottlenecks} />
                    </div>
                  )}
                  <div className="border-t border-border pt-4">
                    <AiOutputActions
                      copyText={copyText}
                      onRegenerate={() => plan.mutate()}
                      busy={plan.isPending}
                    />
                  </div>
                </>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
