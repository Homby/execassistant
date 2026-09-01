import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ExecProfile {
  id: string;
  email: string;
  fullName: string;
  jobTitle: string;
  company: string;
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ExecProfile> => {
    const { supabase, userId, claims } = context;
    const email = (claims as { email?: string }).email ?? "";
    const { data } = await supabase
      .from("profiles")
      .select("full_name, job_title, company")
      .eq("id", userId)
      .maybeSingle();

    return {
      id: userId,
      email,
      fullName: data?.full_name || email.split("@")[0] || "Executive",
      jobTitle: data?.job_title || "Executive",
      company: data?.company || "",
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { fullName: string; jobTitle: string; company: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert({
      id: context.userId,
      full_name: data.fullName,
      job_title: data.jobTitle,
      company: data.company,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
