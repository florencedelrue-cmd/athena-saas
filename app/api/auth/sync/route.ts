import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/server";
import { syncTeacherAccount } from "@/lib/auth-sync";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const service = await createServiceClient();
  const result = await syncTeacherAccount(service, user.id, user.email);

  if (!result.ok) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ success: true, schoolId: result.schoolId });
}
