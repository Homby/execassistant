import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Camera, CalendarCheck, Sparkles, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import avatar from "@/assets/exec-avatar.jpg";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAssistantPreferences, useCalendarConnections } from "@/hooks/use-assistant";
import { useProfile } from "@/hooks/use-profile";
import { connectCalendar, disconnectCalendar } from "@/lib/assistant.functions";
import { supabase } from "@/integrations/supabase/client";
import { setMyAvatar, updateMyProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Exec Assistant" },
      {
        name: "description",
        content:
          "Update your executive profile — name, role and company — and link Google, Outlook or iCloud calendars so your assistant can manage your schedule.",
      },
      { property: "og:title", content: "Your profile — Exec Assistant" },
      {
        property: "og:description",
        content: "Edit your executive profile and connect your calendars in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const providers = ["Google Calendar", "Microsoft Outlook", "Apple iCloud", "Other (ICS)"];
const syncModes = ["two-way", "read-only"];

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: preferences } = useAssistantPreferences();
  const { data: calendars } = useCalendarConnections();

  const update = useServerFn(updateMyProfile);
  const saveAvatar = useServerFn(setMyAvatar);
  const connect = useServerFn(connectCalendar);
  const disconnect = useServerFn(disconnectCalendar);

  const [form, setForm] = useState({ fullName: "", jobTitle: "", company: "" });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [cal, setCal] = useState({
    provider: providers[0]!,
    accountEmail: "",
    calendarUrl: "",
    syncMode: syncModes[0]!,
  });
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName ?? "",
        jobTitle: profile.jobTitle ?? "",
        company: profile.company ?? "",
      });
    }
  }, [profile]);

  async function save() {
    setSaving(true);
    try {
      await update({ data: form });
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile updated");
    } catch {
      toast.error("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please choose an image under 5MB.");
      return;
    }
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("You are signed out.");
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw new Error(error.message);
      await saveAvatar({ data: { path } });
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile picture updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update your picture.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
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
    <AppShell title="Your profile" subtitle="Personal details and connected calendars">
      <div className="space-y-6">
        <Panel
          title={
            <span className="flex items-center gap-2">
              <User className="size-4 text-accent" />
              Executive profile
            </span>
          }
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <img
                src={profile?.avatarUrl || avatar}
                alt={profile?.fullName ? `${profile.fullName} profile picture` : "Profile picture"}
                className="size-16 rounded-full object-cover"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                aria-label="Change profile picture"
                className="absolute -bottom-1 -right-1 rounded-full border border-border bg-card p-1.5 text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-60"
              >
                <Camera className="size-3.5" />
              </button>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {profile?.fullName ?? "Executive"}
              </p>
              <p className="text-xs text-muted-foreground">
                {[profile?.jobTitle, profile?.company].filter(Boolean).join(" · ")}
              </p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhoto(e.target.files?.[0])}
              />
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading…" : "Change photo"}
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Private to you. JPG or PNG, up to 5MB.
              </p>
            </div>
          </div>

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
            <div className="sm:col-span-3">
              <Button size="sm" className="rounded-full" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save profile"}
              </Button>
            </div>
          </div>
        </Panel>

        <Panel
          title={
            <span className="flex items-center gap-2">
              <CalendarCheck className="size-4 text-accent" />
              Linked calendars
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

        <Panel
          title={
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-accent" />
              Assistant personalisation
            </span>
          }
        >
          <p className="text-sm text-muted-foreground">
            {preferences?.assistantName ?? "Your assistant"} responds in a{" "}
            {(preferences?.tone ?? "direct").toLowerCase()} tone with{" "}
            {(preferences?.summaryLength ?? "concise").toLowerCase()} summaries, working{" "}
            {preferences?.workingHours ?? "08:00 - 18:30"} ({preferences?.timezone ?? "Europe/London"}).
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 rounded-full">
            <Link to="/settings">Adjust in settings</Link>
          </Button>
        </Panel>
      </div>
    </AppShell>
  );
}
