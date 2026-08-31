import { NextResponse } from "next/server";
import { getOAuthEmail } from "@/lib/auth-oauth";
import { syncTeacherAccount } from "@/lib/auth-sync";
import { createClient, createServiceClient } from "@/lib/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const authError = searchParams.get("error_description") || searchParams.get("error");

  if (authError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(authError)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Geen autorisatiecode ontvangen.")}`
    );
  }

  const supabase = await createClient();
  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(sessionError.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Inloggen mislukt.")}`
    );
  }

  const email = getOAuthEmail(user);
  if (!email) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Geen school-e-mail gevonden in Microsoft-account.")}`
    );
  }

  const service = await createServiceClient();
  const result = await syncTeacherAccount(service, user.id, email);

  if (!result.ok) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(result.error)}`
    );
  }

  return NextResponse.redirect(`${origin}/`);
}
