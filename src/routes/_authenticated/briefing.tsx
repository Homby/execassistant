import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Sun } from "lucide-react";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { AiOutputActions } from "@/components/ai-output-actions";
import { AppShell } from "@/components/app-shell";
import { BulletList, EmptyState, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { getBriefing } from "@/lib/ai.functions";
import { buildExecContext, todayLabel } from "@/lib/exec-context";

export const Route = createFileRoute("/_authenticated/briefing")({
  head: () => ({
    meta: [
      { title: "Daily executive briefing — Exec Assistant" },
      {
        name: "description",
        content:
          "A one-screen AI briefing: today's priorities, meetings, follow-ups, risks and recommended actions.",
      },
      { property: "og:title", content: "Daily executive briefing — Exec Assistant" },
      {
        property: "og:description",
        content: "Priorities, meetings, follow-ups and risks summarised for the day ahead.",
      },
    ],
  }),
  component: BriefingPage,
});

function BriefingPage() {
  const fn = useServerFn(getBriefing);
  const brief = useMutation({ mutationFn: () => fn({ data: { ctx: buildExecContext() } }) });
  const data = brief.data;

  const copyText = data
    ? [
        data.headline,
        "",
        "Priorities:\n" + data.priorities.map((p) => `- ${p}`).join("\n"),
        "Meetings:\n" + data.meetings.map((p) => `- ${p}`).join("\n"),
        "Follow-ups:\n" + data.followUps.map((p) => `- ${p}`).join("\n"),
        "Risks:\n" + data.risks.map((p) => `- ${p}`).join("\n"),
        "Recommendations:\n" + data.recommendations.map((p) => `- ${p}`).join("\n"),
      ].join("\n")
    : undefined;

  return (
    <AppShell title="Daily briefing" subtitle={`Prepared for ${todayLabel()}`}>
      <div className="space-y-6">
        <div className="rounded-2xl bg-ink p-6 text-ink-foreground shadow-[var(--shadow-raised)] sm:p-8">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-foreground/60">
            <Sun className="size-3.5 text-accent" />
            Executive briefing
          </p>
          <p className="display-serif mt-3 max-w-2xl text-2xl leading-snug sm:text-3xl">
            {data?.headline || "Generate a briefing built from your calendar, tasks and inbox."}
          </p>
          <div className="mt-5">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => brief.mutate()}
              disabled={brief.isPending}
            >
              {brief.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              {data ? "Regenerate briefing" : "Generate briefing"}
            </Button>
          </div>
        </div>

        {brief.isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {(brief.error as Error).message || "The briefing service is unavailable right now."}
          </div>
        )}

        {!data && !brief.isPending && !brief.isError && (
          <EmptyState
            title="No briefing yet"
            hint="Your briefing is generated on demand so nothing is processed until you ask for it."
          />
        )}

        {data && (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Top priorities">
                <BulletList items={data.priorities} />
              </Panel>
              <Panel title="Meetings & preparation">
                <BulletList items={data.meetings} />
              </Panel>
              <Panel title="Follow-ups owed">
                <BulletList items={data.followUps} />
              </Panel>
              <Panel title="Risks & watch items">
                <BulletList items={data.risks} />
              </Panel>
            </div>
            <Panel title="Recommended actions">
              <BulletList items={data.recommendations} />
              <div className="mt-5 space-y-3 border-t border-border pt-4">
                <AiOutputActions copyText={copyText} onRegenerate={() => brief.mutate()} busy={brief.isPending} />
                <AiDisclaimer />
              </div>
            </Panel>
          </>
        )}
      </div>
    </AppShell>
  );
}
