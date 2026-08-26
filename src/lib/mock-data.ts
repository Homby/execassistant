/**
 * Realistic but clearly fictional demo data for the Exec Assistant prototype.
 * This is the single source of truth for the UI layer; swap it for real
 * integrations (Google Calendar, Microsoft 365, Gmail) without touching views.
 */

export type Priority = "critical" | "high" | "medium" | "low";

export interface ExecUser {
  name: string;
  role: string;
  company: string;
  email: string;
  timezone: string;
  workingHours: string;
}

export const execUser: ExecUser = {
  name: "Marcus Vance",
  role: "Chief Operating Officer",
  company: "Northbridge Industries (fictional)",
  email: "m.vance@northbridge.example",
  timezone: "Europe/London",
  workingHours: "08:00 – 18:30",
};

export interface Meeting {
  id: string;
  title: string;
  start: string; // HH:mm
  end: string;
  durationMin: number;
  location: string;
  attendees: string[];
  prepMinutes: number;
  prepReady: boolean;
  conflict?: string;
  note?: string;
  kind: "meeting" | "focus" | "personal" | "buffer";
  day?: number; // 0 = Mon .. 6 = Sun (for week view)
}

export const todaysMeetings: Meeting[] = [
  {
    id: "m1",
    title: "Executive Leadership Meeting",
    start: "09:00",
    end: "10:00",
    durationMin: 60,
    location: "Conference Room A • Hybrid",
    attendees: ["Sarah Chen", "Tom Hirst", "Elena Marsh", "+5"],
    prepMinutes: 15,
    prepReady: true,
    note: "Focusing on international expansion risks",
    kind: "meeting",
    day: 2,
  },
  {
    id: "m2",
    title: "CFO Review: Hiring Budget",
    start: "11:00",
    end: "11:30",
    durationMin: 30,
    location: "Zoom link available",
    attendees: ["Sarah Chen"],
    prepMinutes: 10,
    prepReady: false,
    conflict: "Overlaps Global All-hands briefing",
    kind: "meeting",
    day: 2,
  },
  {
    id: "m3",
    title: "Strategic Partner Call — Vertex Corp",
    start: "14:00",
    end: "15:00",
    durationMin: 60,
    location: "Zoom • External attendees",
    attendees: ["Daniel Okafor", "Priya Raman"],
    prepMinutes: 20,
    prepReady: true,
    note: "Emphasise capital efficiency and delivery record",
    kind: "meeting",
    day: 2,
  },
  {
    id: "m4",
    title: "Board Preparation",
    start: "16:00",
    end: "17:30",
    durationMin: 90,
    location: "Private office • Confidential",
    attendees: ["Elena Marsh"],
    prepMinutes: 30,
    prepReady: false,
    kind: "focus",
    day: 2,
  },
];

export const weekMeetings: Meeting[] = [
  ...todaysMeetings,
  {
    id: "w1",
    title: "Regional Ops Review",
    start: "10:00",
    end: "11:00",
    durationMin: 60,
    location: "Conference Room B",
    attendees: ["Tom Hirst"],
    prepMinutes: 10,
    prepReady: true,
    kind: "meeting",
    day: 0,
  },
  {
    id: "w2",
    title: "Investor Update Draft",
    start: "15:00",
    end: "16:00",
    durationMin: 60,
    location: "Focus block",
    attendees: [],
    prepMinutes: 0,
    prepReady: true,
    kind: "focus",
    day: 0,
  },
  {
    id: "w3",
    title: "Talent Pipeline Sync",
    start: "09:30",
    end: "10:15",
    durationMin: 45,
    location: "Teams",
    attendees: ["People Ops"],
    prepMinutes: 5,
    prepReady: true,
    kind: "meeting",
    day: 1,
  },
  {
    id: "w4",
    title: "Board Meeting",
    start: "10:00",
    end: "12:30",
    durationMin: 150,
    location: "Boardroom 4A",
    attendees: ["Board of Directors"],
    prepMinutes: 60,
    prepReady: false,
    kind: "meeting",
    day: 3,
  },
  {
    id: "w5",
    title: "Family dinner",
    start: "19:00",
    end: "21:00",
    durationMin: 120,
    location: "Personal",
    attendees: [],
    prepMinutes: 0,
    prepReady: true,
    kind: "personal",
    day: 4,
  },
];

export interface Task {
  id: string;
  title: string;
  detail: string;
  priority: Priority;
  due: string;
  project: string;
  effortMin: number;
  delegateTo?: string;
  done: boolean;
  overdue?: boolean;
}

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Review quarterly financial report",
    detail: "Finance flagged two variances in EMEA growth.",
    priority: "critical",
    due: "Today · 12:00",
    project: "Q4 Close",
    effortMin: 45,
    done: false,
    overdue: true,
  },
  {
    id: "t2",
    title: "Approve hiring plan",
    detail: "14 open roles, engineering expansion.",
    priority: "high",
    due: "Today · 17:00",
    project: "People",
    effortMin: 30,
    done: false,
  },
  {
    id: "t3",
    title: "Follow up with strategic partner",
    detail: "Vertex Corp awaiting scope confirmation.",
    priority: "high",
    due: "Tomorrow",
    project: "Partnerships",
    effortMin: 15,
    done: false,
  },
  {
    id: "t4",
    title: "Review board presentation",
    detail: "Version 3 of the strategy deck.",
    priority: "critical",
    due: "Today · 16:00",
    project: "Board",
    effortMin: 60,
    done: false,
  },
  {
    id: "t5",
    title: "Delegate recruitment update",
    detail: "Weekly summary can move to People Ops.",
    priority: "medium",
    due: "Friday",
    project: "People",
    effortMin: 10,
    delegateTo: "People Ops",
    done: false,
  },
  {
    id: "t6",
    title: "Finalise team offsite venue",
    detail: "Two options shortlisted.",
    priority: "low",
    due: "Next week",
    project: "Culture",
    effortMin: 20,
    done: true,
  },
];

export interface Communication {
  id: string;
  from: string;
  subject: string;
  preview: string;
  channel: "Email" | "Slack" | "Teams";
  received: string;
  important: boolean;
}

export const communications: Communication[] = [
  {
    id: "c1",
    from: "Sarah Chen (CFO)",
    subject: "Final budget draft for approval",
    preview: "Marcus — attaching the revised headcount model ahead of the board...",
    channel: "Email",
    received: "14 minutes ago",
    important: true,
  },
  {
    id: "c2",
    from: "Daniel Okafor (Vertex Corp)",
    subject: "Re: Partnership scope",
    preview: "Happy to align on commercials before Thursday if that helps...",
    channel: "Email",
    received: "1 hour ago",
    important: true,
  },
  {
    id: "c3",
    from: "Tom Hirst",
    subject: "Mentioned you in #strategic-planning",
    preview: "Can we get a decision on the Nordics pilot this week?",
    channel: "Slack",
    received: "2 hours ago",
    important: false,
  },
  {
    id: "c4",
    from: "Elena Marsh (Chief of Staff)",
    subject: "Board pack v3 uploaded",
    preview: "Slide 14 still shows the old regional growth figure.",
    channel: "Teams",
    received: "Yesterday",
    important: true,
  },
];

export interface AppNotification {
  id: string;
  type: "meeting" | "prep" | "task" | "deadline" | "conflict" | "ai" | "followup";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export const notifications: AppNotification[] = [
  {
    id: "n1",
    type: "conflict",
    title: "Scheduling conflict at 11:00",
    body: "CFO Review overlaps the Global All-hands briefing.",
    time: "8 min ago",
    unread: true,
  },
  {
    id: "n2",
    type: "prep",
    title: "Prepare for Strategic Partner Call",
    body: "20 minutes of preparation recommended before 14:00.",
    time: "25 min ago",
    unread: true,
  },
  {
    id: "n3",
    type: "task",
    title: "Overdue: Review quarterly financial report",
    body: "Was due today at 12:00.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "n4",
    type: "ai",
    title: "Recommendation",
    body: "Two tasks look suitable for delegation to People Ops.",
    time: "Today · 07:10",
    unread: false,
  },
  {
    id: "n5",
    type: "deadline",
    title: "Board pack deadline",
    body: "Final version due Thursday 09:00.",
    time: "Yesterday",
    unread: false,
  },
];

export interface Integration {
  id: string;
  name: string;
  category: string;
  status: "connected" | "available" | "pending";
  detail: string;
}

export const integrations: Integration[] = [
  { id: "i1", name: "Google Calendar", category: "Calendar", status: "connected", detail: "Simulated · 2-way sync" },
  { id: "i2", name: "Microsoft Outlook", category: "Calendar", status: "available", detail: "Not connected" },
  { id: "i3", name: "Gmail", category: "Email", status: "connected", detail: "Simulated · read-only" },
  { id: "i4", name: "Microsoft 365", category: "Productivity", status: "available", detail: "Not connected" },
  { id: "i5", name: "Slack", category: "Messaging", status: "pending", detail: "Awaiting admin approval" },
  { id: "i6", name: "Microsoft Teams", category: "Messaging", status: "available", detail: "Not connected" },
  { id: "i7", name: "Zoom", category: "Meetings", status: "connected", detail: "Simulated · join links" },
];

export interface ActivityEntry {
  id: string;
  action: string;
  detail: string;
  time: string;
}

export const activityLog: ActivityEntry[] = [
  { id: "a1", action: "AI briefing generated", detail: "Daily briefing · desktop session", time: "Today · 06:42" },
  { id: "a2", action: "Email draft created", detail: "Follow-up to Sarah Chen", time: "Today · 07:15" },
  { id: "a3", action: "Task priority changed", detail: "Board presentation → Critical", time: "Today · 07:20" },
  { id: "a4", action: "Signed in", detail: "London, UK · Chrome on macOS", time: "Today · 06:38" },
  { id: "a5", action: "Integration connected", detail: "Zoom (simulated)", time: "Yesterday · 18:04" },
];

export const meetingNotesSample = `Attendees: Marcus Vance, Sarah Chen, Tom Hirst, Elena Marsh
Topic: Q4 operating plan + Nordics pilot

Sarah walked through the revised headcount model. Engineering wants 14 roles, finance can fund 9 this quarter without touching the contingency. Agreed to stage the remaining 5 into Q1 pending the Vertex partnership signature.

Tom raised that the Nordics pilot is blocked on a data-processing agreement; legal has had it for three weeks. Risk of slipping the March launch.

Elena noted slide 14 of the board pack still shows the old EMEA growth figure (11%, should be 8.4%). Needs correcting before Thursday.

Decision: proceed with 9 roles now. Marcus to approve formally today.
Decision: escalate the DPA to the General Counsel directly.

Open question: do we announce the Nordics pilot at the board meeting or wait for signature?`;

export const askSuggestions = [
  "What are my priorities today?",
  "Prepare me for my 2 PM meeting.",
  "Draft a follow-up email to Sarah.",
  "What meetings can I move?",
  "Summarise today's meetings.",
  "Which tasks should I delegate?",
  "What deadlines are approaching?",
  "Find conflicts in my schedule.",
];

export const priorityLabel: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const emailTones = [
  "Executive",
  "Professional",
  "Concise",
  "Diplomatic",
  "Persuasive",
  "Friendly",
] as const;

export const emailPurposes = [
  "Follow-up",
  "Delegation",
  "Meeting request",
  "Decline",
  "Introduction",
  "Escalation",
  "Thank you",
  "Announcement",
] as const;
