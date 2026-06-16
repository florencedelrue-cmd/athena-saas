import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getEmailDomain,
  getSchoolNameForEmail,
  isAllowedTeacherEmail,
  normalizeEmail,
} from "@/lib/school-domains";
import { seedDemoData } from "@/lib/demo-seed";
import type { School } from "@/types";

export async function getSchoolByEmailDomain(
  supabase: SupabaseClient,
  email: string
): Promise<School | null> {
  const domain = getEmailDomain(email);
  if (!domain) return null;

  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("email_domain", domain)
    .maybeSingle();

  if (error || !data) return null;
  return data as School;
}

export async function syncTeacherAccount(
  supabase: SupabaseClient,
  authUserId: string,
  email: string
): Promise<{ ok: true; schoolId: string } | { ok: false; error: string }> {
  const normalized = normalizeEmail(email);

  if (!isAllowedTeacherEmail(normalized)) {
    return {
      ok: false,
      error: "Alleen @athena-clw.be en @athena-heule.be zijn toegestaan.",
    };
  }

  let school = await getSchoolByEmailDomain(supabase, normalized);

  if (!school) {
    const schoolName = getSchoolNameForEmail(normalized);
    const domain = getEmailDomain(normalized)!;

    const { data: created, error: createError } = await supabase
      .from("schools")
      .insert({
        name: schoolName || domain,
        plan: "pro",
        email_domain: domain,
        subscription_status: "active",
      })
      .select()
      .single();

    if (createError || !created) {
      return { ok: false, error: "School kon niet worden geladen." };
    }
    school = created as School;
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", authUserId)
    .maybeSingle();

  if (!existingUser) {
    const { error: insertError } = await supabase.from("users").insert({
      id: authUserId,
      email: normalized,
      school_id: school.id,
      role: "teacher",
    });

    if (insertError) {
      return { ok: false, error: "Gebruikersprofiel kon niet worden aangemaakt." };
    }
  } else {
    const { error: updateError } = await supabase
      .from("users")
      .update({ email: normalized, school_id: school.id })
      .eq("id", authUserId);

    if (updateError) {
      return { ok: false, error: "Gebruikersprofiel kon niet worden bijgewerkt." };
    }
  }

  try {
    await seedDemoData(supabase, school.id, authUserId);
  } catch {
    // Demo seed is best-effort
  }

  return { ok: true, schoolId: school.id };
}
