import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {action}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="label-caps mb-3">{children}</p>;
}

export function BulletList({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Nothing recorded.</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
