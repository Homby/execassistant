import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

const MODEL = "google/gemini-3.7-flash";

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

/** Shared executive context injected into every structured prompt. */
export interface ExecContext {
  role?: string;
  now?: string;
  calendar?: string;
  tasks?: string;
  preferences?: string;
}

function contextBlock(ctx: ExecContext | undefined) {
  if (!ctx) return "";
  const lines = [
    ctx.role && `USER ROLE: ${ctx.role}`,
    ctx.now && `CURRENT DATE/TIME: ${ctx.now}`,
    ctx.calendar && `CALENDAR CONTEXT:\n${ctx.calendar}`,
    ctx.tasks && `TASK CONTEXT:\n${ctx.tasks}`,
    ctx.preferences && `USER PREFERENCES: ${ctx.preferences}`,
  ].filter(Boolean);
  return lines.length ? `\n\n--- CONTEXT ---\n${lines.join("\n")}\n--- END CONTEXT ---` : "";
}

const SYSTEM = `You are Exec Assistant, an AI chief of staff for C-suite executives.
You write and think like a seasoned executive assistant: precise, concise, decision-oriented.
Never invent access to private company systems. Never pad with filler or pleasantries.
You never claim certainty about data you were not given.`;

async function run(prompt: string, ctx?: ExecContext) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this workspace.");
  const gateway = createLovableAiGatewayProvider(apiKey);
  const result = await generateText({
    model: gateway(MODEL),
    system: SYSTEM,
    prompt: `${prompt}${contextBlock(ctx)}`,
  });
  return result.text.trim();
}

/** Tolerant JSON extraction: models sometimes wrap output in prose or fences. */
export function parseJson<T>(raw: string, fallback: T): T {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.search(/[[{]/);
  const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  if (start === -1 || end === -1) return fallback;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return fallback;
  }
}

/* ------------------------------- Email ---------------------------------- */

export interface EmailResult {
  subject: string;
  body: string;
}

export async function generateEmailImpl(input: {
  instruction: string;
  tone: string;
  purpose: string;
  recipient?: string;
  transform?: "shorten" | "expand" | "improve" | null;
  previous?: string | null;
  ctx?: ExecContext;
}): Promise<EmailResult> {
  const transformNote = input.transform
    ? `\nThis is a revision. Apply this change to the previous draft: ${input.transform.toUpperCase()}.\nPREVIOUS DRAFT:\n${input.previous ?? ""}`
    : "";
  const raw = await run(
    `Write an executive email.
PURPOSE: ${input.purpose}
TONE: ${input.tone}
RECIPIENT: ${input.recipient || "unspecified"}
INSTRUCTION: ${input.instruction}${transformNote}

Rules: no more than 160 words unless expanding. No greeting fluff. Clear ask or decision. Sign as the user's first name.
Return ONLY JSON: {"subject": string, "body": string}`,
    input.ctx,
  );
  return parseJson<EmailResult>(raw, { subject: "", body: raw });
}

/* --------------------------- Meeting summary ---------------------------- */

export interface MeetingSummary {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: { task: string; owner: string; deadline: string }[];
  risks: string[];
  openQuestions: string[];
  followUps: string[];
}

const emptySummary: MeetingSummary = {
  summary: "",
  keyPoints: [],
  decisions: [],
  actionItems: [],
  risks: [],
  openQuestions: [],
  followUps: [],
};

export async function summariseMeetingImpl(input: {
  notes: string;
  ctx?: ExecContext;
}): Promise<MeetingSummary> {
  const raw = await run(
    `Turn these unstructured meeting notes into an executive-ready structured summary.
Use the notes only — do not invent owners or dates that are not implied. Use "Unassigned"/"Not set" when unknown.

NOTES:
${input.notes}

Return ONLY JSON with this shape:
{"summary": string, "keyPoints": string[], "decisions": string[], "actionItems": [{"task": string, "owner": string, "deadline": string}], "risks": string[], "openQuestions": string[], "followUps": string[]}`,
    input.ctx,
  );
  const parsed = parseJson<MeetingSummary>(raw, { ...emptySummary, summary: raw });
  return { ...emptySummary, ...parsed };
}

/* ------------------------------ Task plan ------------------------------- */

export interface PlannedTask {
  title: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  effort: string;
  deadline: string;
  project: string;
  dependsOn: string;
  delegateTo: string;
}

export interface TaskPlan {
  overview: string;
  tasks: PlannedTask[];
  schedule: { slot: string; focus: string }[];
  bottlenecks: string[];
}

const emptyPlan: TaskPlan = { overview: "", tasks: [], schedule: [], bottlenecks: [] };

export async function planTasksImpl(input: { goal: string; ctx?: ExecContext }): Promise<TaskPlan> {
  const raw = await run(
    `Break this executive objective into an actionable plan.
OBJECTIVE / TASK LIST:
${input.goal}

Produce 4–8 tasks maximum. Prioritise ruthlessly, estimate effort, note dependencies, suggest deadlines, and mark anything a competent chief of staff should own instead ("delegateTo", else empty string). Add a recommended schedule of 3–5 slots and any bottlenecks.

Return ONLY JSON:
{"overview": string, "tasks": [{"title": string, "priority": "Critical"|"High"|"Medium"|"Low", "effort": string, "deadline": string, "project": string, "dependsOn": string, "delegateTo": string}], "schedule": [{"slot": string, "focus": string}], "bottlenecks": string[]}`,
    input.ctx,
  );
  const parsed = parseJson<TaskPlan>(raw, { ...emptyPlan, overview: raw });
  return { ...emptyPlan, ...parsed };
}

/* ------------------------------ Briefing -------------------------------- */

export interface Briefing {
  headline: string;
  priorities: string[];
  meetings: string[];
  followUps: string[];
  risks: string[];
  recommendations: string[];
}

const emptyBriefing: Briefing = {
  headline: "",
  priorities: [],
  meetings: [],
  followUps: [],
  risks: [],
  recommendations: [],
};

export async function briefingImpl(input: { ctx?: ExecContext }): Promise<Briefing> {
  const raw = await run(
    `Produce today's executive briefing from the context provided. Be specific and reference real items from the context. Maximum 3 bullets per section, each under 30 words.

Return ONLY JSON:
{"headline": string, "priorities": string[], "meetings": string[], "followUps": string[], "risks": string[], "recommendations": string[]}`,
    input.ctx,
  );
  const parsed = parseJson<Briefing>(raw, { ...emptyBriefing, headline: raw });
  return { ...emptyBriefing, ...parsed };
}

/* ------------------------------- Ask AI --------------------------------- */

export interface AskResult {
  answer: string;
  points: string[];
  actions: string[];
}

export async function askImpl(input: { question: string; ctx?: ExecContext }): Promise<AskResult> {
  const raw = await run(
    `Answer the executive's question using the context. Be direct — lead with the answer.
QUESTION: ${input.question}

Return ONLY JSON: {"answer": string, "points": string[], "actions": string[]}
"answer" is 1–2 sentences. "points" is up to 4 supporting bullets. "actions" is up to 3 short suggested next actions.`,
    input.ctx,
  );
  return parseJson<AskResult>(raw, { answer: raw, points: [], actions: [] });
}
