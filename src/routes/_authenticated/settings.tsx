import { createFileRoute } from "@tanstack/react-router";
import { Plug, Sliders, User } from "lucide-react";
import { useState } from "react";
import avatar from "@/assets/exec-avatar.jpg";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { execUser, integrations } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Exec Assistant" },
      {
        name: "description",
        content:
          "Manage your executive profile, working hours, AI assistant preferences and connected calendar, email and meeting tools.",
      },
      { property: "og:title", content: "Settings — Exec Assistant" },
      {
        property: "og:description",
        content: "Profile, working hours, AI tone preferences and integrations for your workspace.",
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
  { id: "length", label: "Summary length", options: ["Concise", "Standard", "Detailed"] },
  { id: "brief", label: "Briefing delivery", options: ["On demand", "07:00 daily", "Weekdays only"] },
] as const;

function SettingsPage() {
  const [selected, setSelected] = useState<Record<string, string>>({
    tone: "Direct",
    length: "Concise",
    brief: "On demand",
  });
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const update = useServerFn(updateMyProfile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", jobTitle: "", company: "" });
  const [saving, setSaving] = useState(false);

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

  return (
    <AppShell title="Settings" subtitle="Profile, preferences and integrations">
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

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <dt className="label-caps">Working hours</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{execUser.workingHours}</dd>
            </div>
            <div className="rounded-xl border border-border p-4">
              <dt className="label-caps">Time zone</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{execUser.timezone}</dd>
            </div>
          </dl>
        </Panel>


        <Panel title={<span className="flex items-center gap-2"><Sliders className="size-4 text-accent" />Assistant preferences</span>}>
          <div className="space-y-5">
            {prefs.map((p) => (
              <div key={p.id}>
                <p className="text-sm font-medium text-foreground">{p.label}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.options.map((o) => (
                    <button
                      key={o}
                      onClick={() => setSelected((s) => ({ ...s, [p.id]: o }))}
                      className={
                        selected[p.id] === o
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
          </div>
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><Plug className="size-4 text-accent" />Integrations</span>}>
          <ul className="divide-y divide-border">
            {integrations.map((i) => (
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
