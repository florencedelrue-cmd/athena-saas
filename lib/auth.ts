import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import type { AppUser, AuthSession, School } from "@/types";

export async function getUser(): Promise<AuthSession | null> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: appUser, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (userError || !appUser) return null;

  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .select("*")
    .eq("id", appUser.school_id)
    .single();

  if (schoolError || !school) return null;

  return {
    user: appUser as AppUser,
    school: school as School,
  };
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getUser();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    redirect("/");
  }
  return session;
}
