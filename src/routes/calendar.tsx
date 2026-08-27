import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { todaysMeetings, weekMeetings, type Meeting } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar & schedule management — Exec Assistant" },
      {
        name: "description",
        content:
          "See today and the week ahead, spot conflicts, protect focus blocks and know exactly how much preparation each meeting needs.",
      },
      { property: "og:title", content: "Calendar & schedule management — Exec Assistant" },
      {
        property: "og:description",
        content: "Conflict detection, prep time and focus protection for an executive schedule.",
      },
    ],
  }),
  component: CalendarPage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const kindTone: Record<Meeting["kind"], string> = {
  meeting: "border-l-accent bg-accent/5",
  focus: "border-l-success bg-success/5",
  personal: "border-l-muted-foreground bg-muted",
  buffer: "border-l-border bg-muted/50",
};

function MeetingCard({ m }: { m: Meeting }) {
  return (
    <div className={cn("rounded-lg border border-border border-l-[3px] p-3", kindTone[m.kind])}>
      <p className="text-xs font-semibold text-foreground">{m.start}–{m.end}</p>
      <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">{m.title}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <MapPin className="size-3 shrink-0" />
        <span className="truncate">{m.location}</span>
      </p>
      {m.attendees.length > 0 && (
        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Users className="size-3 shrink-0" />
          <span className="truncate">{m.attendees.join(", ")}</span>
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {m.conflict && (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <AlertTriangle className="size-3" />
            {m.conflict}
          </Badge>
        )}
        {m.prepMinutes > 0 && (
          <Badge variant={m.prepReady ? "outline" : "secondary"} className="text-[10px]">
            {m.prepReady ? "Prep ready" : `${m.prepMinutes}m prep needed`}
          </Badge>
        )}
      </div>
      {m.note && <p className="mt-2 text-[11px] italic text-muted-foreground">{m.note}</p>}
    </div>
  );
}

function CalendarPage() {
  const [view, setView] = useState<"day" | "week">("day");
  const booked = todaysMeetings.reduce((n, m) => n + m.durationMin, 0);
  const conflicts = weekMeetings.filter((m) => m.conflict);
  const focusBlocks = weekMeetings.filter((m) => m.kind === "focus");

  return (
    <AppShell title="Calendar" subtitle="Schedule, conflicts and protected focus time">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Booked today", value: `${Math.floor(booked / 60)}h ${booked % 60}m`, icon: Clock },
            { label: "Conflicts this week", value: String(conflicts.length), icon: AlertTriangle },
            { label: "Focus blocks", value: String(focusBlocks.length), icon: CalendarDays },
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

        <div className="flex gap-2">
          {(["day", "week"] as const).map((v) => (
            <Button
              key={v}
              variant={view === v ? "default" : "outline"}
              size="sm"
              className="rounded-full capitalize"
              onClick={() => setView(v)}
            >
              {v} view
            </Button>
          ))}
        </div>

        {view === "day" ? (
          <Panel title="Today" bodyClassName="space-y-3">
            {todaysMeetings.map((m) => (
              <MeetingCard key={m.id} m={m} />
            ))}
          </Panel>
        ) : (
          <Panel title="This week" bodyClassName="p-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {days.map((d, i) => {
                const items = weekMeetings
                  .filter((m) => m.day === i)
                  .sort((a, b) => a.start.localeCompare(b.start));
                return (
                  <div key={d} className="space-y-2">
                    <p className="label-caps mb-0">{d}</p>
                    {items.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-[11px] text-muted-foreground">
                        Clear
                      </p>
                    ) : (
                      items.map((m) => <MeetingCard key={m.id} m={m} />)
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        )}

        {conflicts.length > 0 && (
          <Panel title="Conflicts to resolve" bodyClassName="space-y-3">
            {conflicts.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{m.title}</p>
                  <p className="mt-0.5 text-xs text-destructive">{m.conflict}</p>
                </div>
                <Button variant="outline" size="sm">
                  Suggest a new time
                </Button>
              </div>
            ))}
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
