import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { DEMO_TEACHER_PASSWORD, DEMO_TEACHERS } from "@/lib/demo-accounts";
import { isAuthRequired } from "@/lib/open-access";
import { OPEN_SESSION_SKIP_COOKIE } from "@/lib/open-session-edge";

/** Stille login voor open toegang — deelt één demo-leerkracht voor live Supabase-sync. */
export async function GET(request: Request) {
  if (isAuthRequired()) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const email =
    process.env.OPEN_ACCESS_TEACHER_EMAIL?.trim() || DEMO_TEACHERS[0].email;
  const password =
    process.env.OPEN_ACCESS_TEACHER_PASSWORD?.trim() || DEMO_TEACHER_PASSWORD;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("open-session:", error.message);
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(OPEN_SESSION_SKIP_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return response;
  }

  const nextPath = new URL(request.url).searchParams.get("next") || "/";
  const safePath = nextPath.startsWith("/") ? nextPath : "/";
  const response = NextResponse.redirect(new URL(safePath, request.url));
  response.cookies.delete(OPEN_SESSION_SKIP_COOKIE);
  return response;
}
