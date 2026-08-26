import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  askImpl,
  briefingImpl,
  generateEmailImpl,
  planTasksImpl,
  summariseMeetingImpl,
} from "./ai-gateway.server";

const ctxSchema = z
  .object({
    role: z.string().optional(),
    now: z.string().optional(),
    calendar: z.string().optional(),
    tasks: z.string().optional(),
    preferences: z.string().optional(),
  })
  .optional();

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        instruction: z.string().min(1),
        tone: z.string(),
        purpose: z.string(),
        recipient: z.string().optional(),
        transform: z.enum(["shorten", "expand", "improve"]).nullable().optional(),
        previous: z.string().nullable().optional(),
        ctx: ctxSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => generateEmailImpl(data));

export const summariseMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ notes: z.string().min(1), ctx: ctxSchema }).parse(input),
  )
  .handler(async ({ data }) => summariseMeetingImpl(data));

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ goal: z.string().min(1), ctx: ctxSchema }).parse(input),
  )
  .handler(async ({ data }) => planTasksImpl(data));

export const getBriefing = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ ctx: ctxSchema }).parse(input))
  .handler(async ({ data }) => briefingImpl(data));

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ question: z.string().min(1), ctx: ctxSchema }).parse(input),
  )
  .handler(async ({ data }) => askImpl(data));
