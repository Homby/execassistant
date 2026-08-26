import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-px size-3 shrink-0" aria-hidden />
      AI-generated content may contain mistakes. Review important information before making
      decisions or sending communications.
    </p>
  );
}
