import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  NotebookPen,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import avatar from "@/assets/exec-avatar.jpg";
import { AskAssistantDialog } from "@/components/ask-assistant";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { greeting, todayLabel } from "@/lib/exec-context";
import { notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/briefing", label: "Daily briefing", icon: Sun },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/email", label: "Email assistant", icon: Mail },
  { to: "/meetings", label: "Meeting notes", icon: NotebookPen },
  { to: "/tasks", label: "Task planner", icon: CheckSquare },
  { to: "/security", label: "Privacy & security", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Sparkles className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Exec Assistant</p>
          <p className="text-[11px] text-sidebar-foreground/60">AI chief of staff</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className={cn("size-4", active && "text-accent")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold">
          <Lock className="size-3 text-accent" />
          Private workspace
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/60">
          Data stays in your session. Nothing is shared without your action.
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-sidebar-border px-5 py-4">
        <img src={avatar} alt="" className="size-9 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{profile?.fullName ?? "Executive"}</p>
          <p className="truncate text-[11px] text-sidebar-foreground/60">
            {profile?.jobTitle ?? profile?.email ?? ""}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-ink/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-surface text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3.5 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </Button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
                {title}
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                {subtitle ?? `${greeting()}, ${firstName} · ${todayLabel()}`}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="hidden rounded-full sm:inline-flex"
              onClick={() => setAskOpen(true)}
            >
              <Search className="size-3.5" />
              Ask assistant
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="size-5" />
                  {unread > 0 && (
                    <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <p className="border-b border-border px-4 py-3 text-sm font-semibold">
                  Notifications
                </p>
                <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id} className="px-4 py-3">
                      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {n.unread && <span className="size-1.5 rounded-full bg-accent" />}
                        {n.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">{n.time}</p>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>

      <AskAssistantDialog open={askOpen} onOpenChange={setAskOpen} />
    </div>
  );
}
