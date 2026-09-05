import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ExecProfile {
  id: string;
  email: string;
  fullName: string;
  jobTitle: string;
  company: string;
  avatarUrl: string | null;
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ExecProfile> => {
    const { supabase, userId, claims } = context;
    const email = (claims as { email?: string }).email ?? "";
    const { data } = await supabase
      .from("profiles")
      .select("full_name, job_title, company, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    return {
      id: userId,
      email,
      fullName: data?.full_name || email.split("@")[0] || "Executive",
      jobTitle: data?.job_title || "Executive",
      company: data?.company || "",
      avatarUrl: await signAvatar(supabase, data?.avatar_url ?? null),
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

async function signAvatar(
  supabase: { storage: { from: (b: string) => { createSignedUrl: (p: string, e: number) => Promise<{ data: { signedUrl: string } | null }> } } },
  path: string | null,
): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export const setMyAvatar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path: string }) => input)
  .handler(async ({ data, context }) => {
    if (!data.path.startsWith(`${context.userId}/`)) {
      throw new Error("Invalid image path");
    }
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, avatar_url: data.path });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
