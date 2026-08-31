import { NextResponse } from "next/server";
import {
  getAdminPreviewCookieOptions,
  isAdminPreviewConfigured,
  isValidAdminPreviewKey,
} from "@/lib/admin-preview";

export async function GET(request: Request) {
  if (!isAdminPreviewConfigured()) {
    return NextResponse.json(
      { error: "Admin preview is niet geconfigureerd (ADMIN_PREVIEW_SECRET ontbreekt)." },
      { status: 503 }
    );
  }

  const key = new URL(request.url).searchParams.get("key");
  if (!isValidAdminPreviewKey(key)) {
    return NextResponse.redirect(
      new URL("/login?error=Ongeldige%20beheerderssleutel.", request.url)
    );
  }

  const cookie = getAdminPreviewCookieOptions();
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    maxAge: cookie.maxAge,
    path: cookie.path,
  });
  return response;
}
