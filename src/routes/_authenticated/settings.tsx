import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck, Plug, Sliders, Sparkles, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import avatar from "@/assets/exec-avatar.jpg";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAssistantPreferences, useCalendarConnections } from "@/hooks/use-assistant";
import { useProfile } from "@/hooks/use-profile";
import {
  connectCalendar,
  disconnectCalendar,
  saveAssistantPreferences,
  type AssistantPreferences,
} from "@/lib/assistant.functions";
import { updateMyProfile } from "@/lib/profile.functions";
import { integrations } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Exec Assistant" },
      {
        name: "description",
        content:
          "Personalise your AI assistant, set working hours and tone, and link your Google, Outlook or iCloud calendars for live schedule intelligence.",
      },
      { property: "og:title", content: "Settings — Exec Assistant" },
      {
        property: "og:description",
        content: "Assistant personalisation, working hours and connected calendars for your workspace.",
      },
    ],
  }),
  component: SettingsPage,
});

const statusStyles: Record<string, string> = {
  connected: "bg-accent/10 text-accent",
  pending: "bg-warning/10 text-warning",
  available: "bg-muted text-muted-foreground",
};

const prefs = [
  { id: "tone", label: "Default email tone", options: ["Direct", "Diplomatic", "Warm"] },
  { id: "summaryLength", label: "Summary length", options: ["Concise", "Standard", "Detailed"] },
  {
    id: "briefingDelivery",
    label: "Briefing delivery",
    options: ["On demand", "07:00 daily", "Weekdays only"],
  },
] as const;

const providers = ["Google Calendar", "Microsoft Outlook", "Apple iCloud", "Other (ICS)"];
const syncModes = ["two-way", "read-only"];

function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: preferences } = useAssistantPreferences();
  const { data: calendars } = useCalendarConnections();

  const update = useServerFn(updateMyProfile);
  const savePrefs = useServerFn(saveAssistantPreferences);
  const connect = useServerFn(connectCalendar);
  const disconnect = useServerFn(disconnectCalendar);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", jobTitle: "", company: "" });
  const [saving, setSaving] = useState(false);

  const [prefForm, setPrefForm] = useState<AssistantPreferences | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [cal, setCal] = useState({
    provider: providers[0],
    accountEmail: "",
    calendarUrl: "",
    syncMode: syncModes[0],
  });
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (preferences) setPrefForm(preferences);
  }, [preferences]);

  function startEditing() {
    setForm({
      fullName: profile?.fullName ?? "",
      jobTitle: profile?.jobTitle ?? "",
      company: profile?.company ?? "",
    });
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    try {
      await update({ data: form });
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile updated");
      setEditing(false);
    } catch {
      toast.error("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePrefs() {
    if (!prefForm) return;
    setSavingPrefs(true);
    try {
      await savePrefs({ data: prefForm });
      await queryClient.invalidateQueries({ queryKey: ["assistant-preferences"] });
      toast.success(`${prefForm.assistantName || "Your assistant"} is personalised`);
    } catch {
      toast.error("Could not save your preferences. Please try again.");
    } finally {
      setSavingPrefs(false);
    }
  }

  async function handleConnect() {
    setConnecting(true);
    try {
      await connect({ data: cal });
      await queryClient.invalidateQueries({ queryKey: ["calendar-connections"] });
      toast.success(`${cal.provider} linked`);
      setCal({ ...cal, accountEmail: "", calendarUrl: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not link that calendar.");
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect(id: string) {
    try {
      await disconnect({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["calendar-connections"] });
      toast.success("Calendar disconnected");
    } catch {
      toast.error("Could not disconnect that calendar.");
    }
  }

  return (
    <AppShell title="Settings" subtitle="Profile, assistant personalisation and connected calendars">
      <div className="space-y-6">
        <Panel title={<span className="flex items-center gap-2"><User className="size-4 text-accent" />Executive profile</span>}>
          <div className="flex flex-wrap items-center gap-4">
            <img src={avatar} alt="" className="size-16 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {profile?.fullName ?? "Executive"}
              </p>
              <p className="text-xs text-muted-foreground">
                {[profile?.jobTitle, profile?.company].filter(Boolean).join(" · ")}
              </p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto rounded-full"
                onClick={startEditing}
              >
                Edit profile
              </Button>
            )}
          </div>

          {editing && (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jobTitle">Job title</Label>
                <Input
                  id="jobTitle"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
              <div className="flex gap-2 sm:col-span-3">
                <Button size="sm" className="rounded-full" onClick={save} disabled={saving}>
                  Save changes
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Panel>

        <Panel
          title={
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-accent" />Personalise your assistant
            </span>
          }
        >
          {prefForm && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="assistantName">Assistant name</Label>
                  <Input
                    id="assistantName"
                    value={prefForm.assistantName}
                    onChange={(e) => setPrefForm({ ...prefForm, assistantName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="workingHours">Working hours</Label>
                  <Input
                    id="workingHours"
                    value={prefForm.workingHours}
                    onChange={(e) => setPrefForm({ ...prefForm, workingHours: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timezone">Time zone</Label>
                  <Input
                    id="timezone"
                    value={prefForm.timezone}
                    onChange={(e) => setPrefForm({ ...prefForm, timezone: e.target.value })}
                  />
                </div>
              </div>

              {prefs.map((p) => (
                <div key={p.id}>
                  <p className="text-sm font-medium text-foreground">{p.label}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {p.options.map((o) => (
                      <button
                        key={o}
                        onClick={() => setPrefForm({ ...prefForm, [p.id]: o })}
                        className={
                          prefForm[p.id] === o
                            ? "rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-ink-foreground"
                            : "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        }
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-1.5">
                <Label htmlFor="focusAreas">Priorities your assistant should protect</Label>
                <Textarea
                  id="focusAreas"
                  rows={3}
                  placeholder="e.g. Board readiness, Q3 integration, no meetings before 09:00, always leave 30m prep before investor calls"
                  value={prefForm.focusAreas}
                  onChange={(e) => setPrefForm({ ...prefForm, focusAreas: e.target.value })}
                />
              </div>

              <Button
                size="sm"
                className="rounded-full"
                onClick={handleSavePrefs}
                disabled={savingPrefs}
              >
                {savingPrefs ? "Saving…" : "Save personalisation"}
              </Button>
            </div>
          )}
        </Panel>

        <Panel
          title={
            <span className="flex items-center gap-2">
              <CalendarCheck className="size-4 text-accent" />Linked calendars
            </span>
          }
        >
          {calendars && calendars.length > 0 ? (
            <ul className="divide-y divide-border">
              {calendars.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{c.provider}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.accountEmail} · {c.syncMode} sync
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant="outline" className="text-[11px] capitalize">
                      {c.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-destructive hover:text-destructive"
                      onClick={() => handleDisconnect(c.id)}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Disconnect</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              No calendars linked yet. Link one so your assistant can see meetings, conflicts and prep
              time.
            </p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Provider</Label>
              <div className="flex flex-wrap gap-2">
                {providers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setCal({ ...cal, provider: p })}
                    className={
                      cal.provider === p
                        ? "rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-ink-foreground"
                        : "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accountEmail">Calendar account email</Label>
              <Input
                id="accountEmail"
                type="email"
                placeholder="you@company.com"
                value={cal.accountEmail}
                onChange={(e) => setCal({ ...cal, accountEmail: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="calendarUrl">Calendar / ICS URL (optional)</Label>
              <Input
                id="calendarUrl"
                placeholder="https://…/basic.ics"
                value={cal.calendarUrl}
                onChange={(e) => setCal({ ...cal, calendarUrl: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Sync mode</Label>
              <div className="flex gap-2">
                {syncModes.map((m) => (
                  <button
                    key={m}
                    onClick={() => setCal({ ...cal, syncMode: m })}
                    className={
                      cal.syncMode === m
                        ? "rounded-full bg-ink px-3 py-1.5 text-xs font-semibold capitalize text-ink-foreground"
                        : "rounded-full border border-border px-3 py-1.5 text-xs capitalize text-muted-foreground transition-colors hover:text-foreground"
                    }
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Button
                size="sm"
                className="rounded-full"
                onClick={handleConnect}
                disabled={connecting}
              >
                {connecting ? "Linking…" : "Link calendar"}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><Plug className="size-4 text-accent" />Other integrations</span>}>
          <ul className="divide-y divide-border">
            {integrations
              .filter((i) => i.category !== "Calendar")
              .map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{i.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.category} · {i.detail}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyles[i.status]}`}
                    >
                      {i.status}
                    </span>
                    <Button variant="outline" size="sm" className="rounded-full">
                      {i.status === "connected" ? "Manage" : "Connect"}
                    </Button>
                  </div>
                </li>
              ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
