import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, NotebookPen, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { AiOutputActions } from "@/components/ai-output-actions";
import { AppShell } from "@/components/app-shell";
import { BulletList, EmptyState, Panel, SectionLabel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { summariseMeeting } from "@/lib/ai.functions";
import { buildExecContext } from "@/lib/exec-context";
import { meetingNotesSample, todaysMeetings } from "@/lib/mock-data";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting notes summarizer — Exec Assistant" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into an executive summary with decisions, action items, owners, risks and follow-ups in one step.",
      },
      { property: "og:title", content: "Meeting notes summarizer — Exec Assistant" },
      {
        property: "og:description",
        content: "Structured decisions, owners and follow-ups extracted from unstructured notes.",
      },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const fn = useServerFn(summariseMeeting);
  const [notes, setNotes] = useState("");

  const summarise = useMutation({
    mutationFn: () => fn({ data: { notes, ctx: buildExecContext() } }),
    onError: () => toast.error("Summarisation failed. Try again."),
  });

  const s = summarise.data;
  const copyText = s
    ? [
        s.summary,
        s.keyPoints.length ? `\nKey points:\n- ${s.keyPoints.join("\n- ")}` : "",
        s.decisions.length ? `\nDecisions:\n- ${s.decisions.join("\n- ")}` : "",
        s.actionItems.length
          ? `\nAction items:\n${s.actionItems
              .map((a) => `- ${a.task} — ${a.owner} (${a.deadline})`)
              .join("\n")}`
          : "",
        s.risks.length ? `\nRisks:\n- ${s.risks.join("\n- ")}` : "",
        s.openQuestions.length ? `\nOpen questions:\n- ${s.openQuestions.join("\n- ")}` : "",
        s.followUps.length ? `\nFollow-ups:\n- ${s.followUps.join("\n- ")}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return (
    <AppShell title="Meeting notes" subtitle="From raw notes to decisions, owners and follow-ups">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Panel title="Paste your notes" bodyClassName="space-y-4">
          <Textarea
            rows={18}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste transcript fragments, bullet points or shorthand notes…"
            className="leading-relaxed"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => summarise.mutate()}
              disabled={!notes.trim() || summarise.isPending}
            >
              {summarise.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              Summarise
            </Button>
            <Button variant="outline" onClick={() => setNotes(meetingNotesSample)}>
              <NotebookPen className="size-4" />
              Load example notes
            </Button>
          </div>
          <div className="border-t border-border pt-4">
            <SectionLabel>Today&apos;s meetings</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {todaysMeetings.map((m) => (
                <Badge key={m.id} variant="outline" className="text-[11px]">
                  {m.start} {m.title}
                </Badge>
              ))}
            </div>
          </div>
          <AiDisclaimer />
        </Panel>

        <Panel title="Executive summary" bodyClassName="space-y-5">
          {!s && !summarise.isPending && (
            <EmptyState
              title="No summary yet"
              hint="Paste notes from any meeting and Exec Assistant will extract decisions, owners, deadlines and risks."
            />
          )}
          {summarise.isPending && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Structuring your notes…
            </div>
          )}
          {s && (
            <>
              {s.summary && (
                <p className="text-sm leading-relaxed text-foreground">{s.summary}</p>
              )}

              <div>
                <SectionLabel>Key points</SectionLabel>
                <BulletList items={s.keyPoints} />
              </div>

              <div className="border-t border-border pt-4">
                <SectionLabel>Decisions</SectionLabel>
                <BulletList items={s.decisions} />
              </div>

              <div className="border-t border-border pt-4">
                <SectionLabel>Action items</SectionLabel>
                {s.actionItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">None identified.</p>
                ) : (
                  <ul className="space-y-2">
                    {s.actionItems.map((a, i) => (
                      <li
                        key={i}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3"
                      >
                        <span className="text-sm text-foreground">{a.task}</span>
                        <span className="flex gap-1.5">
                          <Badge variant="secondary" className="text-[10px]">
                            {a.owner}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {a.deadline}
                          </Badge>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <SectionLabel>Risks</SectionLabel>
                <BulletList items={s.risks} />
              </div>

              <div className="border-t border-border pt-4">
                <SectionLabel>Open questions</SectionLabel>
                <BulletList items={s.openQuestions} />
              </div>

              <div className="border-t border-border pt-4">
                <SectionLabel>Suggested follow-ups</SectionLabel>
                <BulletList items={s.followUps} />
              </div>

              <div className="border-t border-border pt-4">
                <AiOutputActions
                  copyText={copyText}
                  onRegenerate={() => summarise.mutate()}
                  busy={summarise.isPending}
                />
              </div>
              <AiDisclaimer />
            </>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
