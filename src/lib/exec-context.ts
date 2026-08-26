import { communications, execUser, tasks, todaysMeetings } from "./mock-data";

/**
 * Builds the structured context object sent with every AI request.
 * Only data the user has explicitly connected (simulated here) is included.
 */
export function buildExecContext() {
  const now = new Date();
  return {
    role: `${execUser.role} at ${execUser.company}`,
    now: now.toLocaleString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/London",
    }),
    calendar: todaysMeetings
      .map(
        (m) =>
          `${m.start}–${m.end} ${m.title} (${m.location}; attendees: ${
            m.attendees.join(", ") || "none"
          }; prep ${m.prepMinutes}m${m.conflict ? `; CONFLICT: ${m.conflict}` : ""})`,
      )
      .join("\n"),
    tasks: tasks
      .filter((t) => !t.done)
      .map(
        (t) =>
          `${t.title} — ${t.priority}, due ${t.due}, ~${t.effortMin}m, project ${t.project}${
            t.overdue ? ", OVERDUE" : ""
          }${t.delegateTo ? `, delegable to ${t.delegateTo}` : ""}`,
      )
      .join("\n"),
    preferences: `Working hours ${execUser.workingHours} ${execUser.timezone}. Prefers concise, decision-first output. Outstanding communications: ${communications
      .filter((c) => c.important)
      .map((c) => `${c.from} — ${c.subject}`)
      .join("; ")}`,
  };
}

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export const todayLabel = () =>
  new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
