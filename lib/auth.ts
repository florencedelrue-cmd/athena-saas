import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/server";
import { syncTeacherAccount } from "@/lib/auth-sync";
import type { AppUser, AuthSession, School } from "@/types";

async function loadSessionForAuthUser(
  authUserId: string,
  email: string
): Promise<AuthSession | null> {
  const supabase = await createClient();

  let { data: appUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUserId)
    .maybeSingle();

  if (!appUser) {
    const service = await createServiceClient();
    const synced = await syncTeacherAccount(service, authUserId, email);
    if (!synced.ok) return null;

    const retry = await supabase.from("users").select("*").eq("id", authUserId).single();
    appUser = retry.data;
  }

  if (!appUser) return null;

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", appUser.school_id)
    .single();

  if (!school) return null;

  return {
    user: appUser as AppUser,
    school: school as School,
  };
}

export async function getUser(): Promise<AuthSession | null> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  return loadSessionForAuthUser(authUser.id, authUser.email);
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
