import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Mail, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { AiOutputActions } from "@/components/ai-output-actions";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/lib/ai.functions";
import { buildExecContext } from "@/lib/exec-context";
import { communications, emailPurposes, emailTones } from "@/lib/mock-data";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "AI email assistant for executives — Exec Assistant" },
      {
        name: "description",
        content:
          "Draft executive-grade emails in seconds: choose purpose and tone, then shorten, expand or refine the draft before you send it.",
      },
      { property: "og:title", content: "AI email assistant — Exec Assistant" },
      {
        property: "og:description",
        content: "Generate, refine and reuse executive email drafts with full control over tone.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [instruction, setInstruction] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<string>(emailTones[0]);
  const [purpose, setPurpose] = useState<string>(emailPurposes[0]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<{ subject: string; body: string }[]>([]);

  const generate = useMutation({
    mutationFn: (transform: "shorten" | "expand" | "improve" | null) =>
      fn({
        data: {
          instruction: instruction || "Follow up on the outstanding decision.",
          tone,
          purpose,
          recipient,
          transform,
          previous: transform ? body : null,
          ctx: buildExecContext(),
        },
      }),
    onSuccess: (res) => {
      setSubject(res.subject);
      setBody(res.body);
      setEditing(false);
    },
    onError: () => toast.error("Draft generation failed. Try again."),
  });

  const hasDraft = Boolean(subject || body);

  return (
    <AppShell title="Email assistant" subtitle="Draft, refine and reuse executive communications">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Panel title="What do you need to send?" bodyClassName="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Sarah Chen (CFO)"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emailPurposes.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emailTones.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instruction">Instruction</Label>
            <Textarea
              id="instruction"
              rows={6}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Confirm we're proceeding with 9 roles now and staging the remaining 5 into Q1."
            />
          </div>

          <Button
            className="w-full"
            onClick={() => generate.mutate(null)}
            disabled={generate.isPending}
          >
            {generate.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Generate draft
          </Button>

          <div className="border-t border-border pt-4">
            <p className="label-caps">Reply to outstanding messages</p>
            <div className="space-y-2">
              {communications.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setRecipient(c.from);
                    setPurpose("Follow-up");
                    setInstruction(`Reply to "${c.subject}": ${c.preview}`);
                  }}
                  className="w-full rounded-xl border border-border p-3 text-left transition-colors hover:border-accent"
                >
                  <p className="flex items-center justify-between gap-2 text-sm font-medium text-foreground">
                    <span className="truncate">{c.from}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {c.channel}
                    </Badge>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.subject}</p>
                </button>
              ))}
            </div>
          </div>

          <AiDisclaimer />
        </Panel>

        <div className="space-y-6">
          <Panel
            title="Draft"
            action={hasDraft ? <Badge variant="secondary">{tone}</Badge> : null}
            bodyClassName="space-y-4"
          >
            {!hasDraft && !generate.isPending ? (
              <EmptyState
                title="No draft yet"
                hint="Describe what you need to say and Exec Assistant will write a decision-first email you can refine."
              />
            ) : generate.isPending ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Writing your draft…
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    readOnly={!editing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    rows={14}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    readOnly={!editing}
                    className="leading-relaxed"
                  />
                </div>
                <AiOutputActions
                  copyText={`Subject: ${subject}\n\n${body}`}
                  editing={editing}
                  onEdit={() => setEditing((v) => !v)}
                  onRegenerate={() => generate.mutate(null)}
                  onImprove={() => generate.mutate("improve")}
                  onShorten={() => generate.mutate("shorten")}
                  onExpand={() => generate.mutate("expand")}
                  onSave={() => {
                    setSaved((s) => [{ subject, body }, ...s]);
                    toast.success("Draft saved");
                  }}
                  onDiscard={() => {
                    setSubject("");
                    setBody("");
                  }}
                  busy={generate.isPending}
                />
              </>
            )}
          </Panel>

          {saved.length > 0 && (
            <Panel title="Saved drafts" bodyClassName="space-y-2">
              {saved.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSubject(d.subject);
                    setBody(d.body);
                  }}
                  className="flex w-full items-start gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-accent"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {d.subject || "Untitled draft"}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {d.body}
                    </span>
                  </span>
                </button>
              ))}
            </Panel>
          )}
        </div>
      </div>
    </AppShell>
  );
}
