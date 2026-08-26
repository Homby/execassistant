import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { askAssistant } from "@/lib/ai.functions";
import { buildExecContext } from "@/lib/exec-context";
import { askSuggestions } from "@/lib/mock-data";

export function useAskAssistant() {
  const fn = useServerFn(askAssistant);
  return useMutation({
    mutationFn: (question: string) => fn({ data: { question, ctx: buildExecContext() } }),
  });
}

export function AskAssistantPanel({ compact = false }: { compact?: boolean }) {
  const [question, setQuestion] = useState("");
  const ask = useAskAssistant();

  const submit = (q: string) => {
    const value = q.trim();
    if (!value) return;
    setQuestion(value);
    ask.mutate(value);
  };

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(question);
        }}
        className="flex gap-2"
      >
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask Exec Assistant…"
          aria-label="Ask Exec Assistant"
          className="h-11 rounded-full bg-muted"
        />
        <Button type="submit" size="lg" className="rounded-full px-5" disabled={ask.isPending}>
          {ask.isPending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          <span className="sr-only sm:not-sr-only">Ask</span>
        </Button>
      </form>

      {!ask.data && !ask.isPending && (
        <div className="flex flex-wrap gap-2">
          {askSuggestions.slice(0, compact ? 4 : 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {ask.isPending && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-5 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Reviewing your calendar, tasks and communications…
        </div>
      )}

      {ask.isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {(ask.error as Error).message || "The assistant is unavailable right now."}
          <Button variant="outline" size="sm" className="ml-3" onClick={() => submit(question)}>
            Try again
          </Button>
        </div>
      )}

      {ask.data && (
        <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-accent" />
            <span className="label-caps">Assistant response</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{ask.data.answer}</p>
          {ask.data.points.length > 0 && (
            <ul className="space-y-2 border-t border-border pt-4">
              {ask.data.points.map((p, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          )}
          {ask.data.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              {ask.data.actions.map((a, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
          <AiDisclaimer />
        </div>
      )}
    </div>
  );
}

export function AskAssistantDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">Ask Exec Assistant</DialogTitle>
        </DialogHeader>
        <AskAssistantPanel compact />
      </DialogContent>
    </Dialog>
  );
}
