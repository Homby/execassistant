import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, MailCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Exec Assistant" },
      {
        name: "description",
        content:
          "Sign in to your Exec Assistant workspace, or create an account to get AI briefings, calendar triage and meeting summaries.",
      },
      { property: "og:title", content: "Sign in — Exec Assistant" },
      {
        property: "og:description",
        content: "Access your private executive workspace: briefings, calendar, email and tasks.",
      },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, job_title: jobTitle, company },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard", replace: true });
        else setConfirmSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onForgotPassword() {
    setError(null);
    setNotice(null);
    if (!email) {
      setError("Enter your email address first, then choose “Forgot password”.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) setError(error.message);
    else setNotice("Password reset link sent. Check your inbox.");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink p-10 text-ink-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm font-semibold">Exec Assistant</span>
        </Link>
        <div>
          <p className="display-serif max-w-md text-3xl leading-snug">
            Your chief of staff: briefings, calendar triage, drafted replies and ruthless
            prioritisation.
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-foreground/60">
            Private by design. Nothing is processed until you ask, and every AI output is a draft
            you review before it leaves your desk.
          </p>
        </div>
        <p className="text-[11px] text-ink-foreground/40">
          Demo workspace · sample calendar and inbox data
        </p>
      </div>

      <div className="flex items-center justify-center bg-background px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold lg:hidden">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Sparkles className="size-4" />
            </span>
            Exec Assistant
          </Link>

          {confirmSent ? (
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
              <MailCheck className="size-6 text-accent" />
              <h1 className="mt-4 text-lg font-semibold text-foreground">Confirm your email</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We sent a confirmation link to <span className="font-medium">{email}</span>. Click it
                to activate your workspace, then sign in.
              </p>
              <Button
                variant="outline"
                className="mt-5 w-full rounded-full"
                onClick={() => {
                  setConfirmSent(false);
                  setMode("signin");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {mode === "signin" ? "Sign in" : "Create your workspace"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Access your executive workspace."
                  : "A few details so your assistant knows who it works for."}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setError(null);
                      setNotice(null);
                    }}
                    className={
                      mode === m
                        ? "rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-[var(--shadow-card)]"
                        : "rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                {mode === "signup" && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        autoComplete="name"
                        placeholder="Marcus Vance"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="jobTitle">Job title</Label>
                        <Input
                          id="jobTitle"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="Chief Operating Officer"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Northbridge"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  />
                  {mode === "signup" && (
                    <p className="text-[11px] text-muted-foreground">At least 8 characters.</p>
                  )}
                </div>

                {error && (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    {error}
                  </p>
                )}
                {notice && (
                  <p className="rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground">
                    {notice}
                  </p>
                )}

                <Button type="submit" className="w-full rounded-full" disabled={busy}>
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
