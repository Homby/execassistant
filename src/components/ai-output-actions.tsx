import { Check, Copy, Pencil, RefreshCw, Save, Scissors, Sparkles, Trash2, Type } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface AiActionsProps {
  copyText?: string;
  onRegenerate?: () => void;
  onShorten?: () => void;
  onExpand?: () => void;
  onImprove?: () => void;
  onEdit?: () => void;
  editing?: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
  busy?: boolean;
}

export function AiOutputActions({
  copyText,
  onRegenerate,
  onShorten,
  onExpand,
  onImprove,
  onEdit,
  editing,
  onSave,
  onDiscard,
  busy,
}: AiActionsProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Copy failed — select the text manually");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onEdit && (
        <Button variant="outline" size="sm" onClick={onEdit} disabled={busy}>
          <Pencil className="size-3.5" />
          {editing ? "Done editing" : "Edit"}
        </Button>
      )}
      {onRegenerate && (
        <Button variant="outline" size="sm" onClick={onRegenerate} disabled={busy}>
          <RefreshCw className="size-3.5" />
          Regenerate
        </Button>
      )}
      {onImprove && (
        <Button variant="outline" size="sm" onClick={onImprove} disabled={busy}>
          <Sparkles className="size-3.5" />
          Improve
        </Button>
      )}
      {onShorten && (
        <Button variant="outline" size="sm" onClick={onShorten} disabled={busy}>
          <Scissors className="size-3.5" />
          Shorten
        </Button>
      )}
      {onExpand && (
        <Button variant="outline" size="sm" onClick={onExpand} disabled={busy}>
          <Type className="size-3.5" />
          Expand
        </Button>
      )}
      {copyText !== undefined && (
        <Button variant="outline" size="sm" onClick={copy} disabled={busy}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          Copy
        </Button>
      )}
      {onSave && (
        <Button size="sm" onClick={onSave} disabled={busy}>
          <Save className="size-3.5" />
          Save
        </Button>
      )}
      {onDiscard && (
        <Button variant="ghost" size="sm" onClick={onDiscard} disabled={busy}>
          <Trash2 className="size-3.5" />
          Discard
        </Button>
      )}
    </div>
  );
}
