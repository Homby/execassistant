import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface AssistantPreferences {
  assistantName: string;
  tone: string;
  summaryLength: string;
  briefingDelivery: string;
  workingHours: string;
  timezone: string;
  focusAreas: string;
}

export interface CalendarConnection {
  id: string;
  provider: string;
  accountEmail: string;
  calendarUrl: string;
  syncMode: string;
  status: string;
}

const DEFAULTS: AssistantPreferences = {
  assistantName: "Ava",
  tone: "Direct",
  summaryLength: "Concise",
  briefingDelivery: "On demand",
  workingHours: "08:00 - 18:30",
  timezone: "Europe/London",
  focusAreas: "",
};

export const getAssistantPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AssistantPreferences> => {
    const { data } = await context.supabase
      .from("assistant_preferences")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!data) return DEFAULTS;
    return {
      assistantName: data.assistant_name,
      tone: data.tone,
      summaryLength: data.summary_length,
      briefingDelivery: data.briefing_delivery,
      workingHours: data.working_hours,
      timezone: data.timezone,
      focusAreas: data.focus_areas ?? "",
    };
  });

export const saveAssistantPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Partial<AssistantPreferences>) => input)
  .handler(async ({ data, context }) => {
    const merged = { ...DEFAULTS, ...data };
    const { error } = await context.supabase.from("assistant_preferences").upsert({
      user_id: context.userId,
      assistant_name: merged.assistantName,
      tone: merged.tone,
      summary_length: merged.summaryLength,
      briefing_delivery: merged.briefingDelivery,
      working_hours: merged.workingHours,
      timezone: merged.timezone,
      focus_areas: merged.focusAreas || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listCalendarConnections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CalendarConnection[]> => {
    const { data, error } = await context.supabase
      .from("calendar_connections")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id,
      provider: r.provider,
      accountEmail: r.account_email,
      calendarUrl: r.calendar_url ?? "",
      syncMode: r.sync_mode,
      status: r.status,
    }));
  });

export const connectCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { provider: string; accountEmail: string; calendarUrl?: string; syncMode?: string }) => {
      if (!input.provider) throw new Error("Choose a calendar provider");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.accountEmail))
        throw new Error("Enter the email address of the calendar account");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("calendar_connections").upsert(
      {
        user_id: context.userId,
        provider: data.provider,
        account_email: data.accountEmail,
        calendar_url: data.calendarUrl || null,
        sync_mode: data.syncMode || "two-way",
        status: "connected",
      },
      { onConflict: "user_id,provider,account_email" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const disconnectCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("calendar_connections")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
