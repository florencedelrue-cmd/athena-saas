import { createHash, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_PREVIEW_COOKIE = "athena_admin_preview";

export function getAdminPreviewCookieValue(secret: string): string {
  return createHash("sha256").update(`athena-admin-preview:${secret}`).digest("hex").slice(0, 32);
}

export function isAdminPreviewConfigured(): boolean {
  return Boolean(process.env.ADMIN_PREVIEW_SECRET);
}

export function isValidAdminPreviewKey(key: string | null | undefined): boolean {
  const secret = process.env.ADMIN_PREVIEW_SECRET;
  if (!secret || !key) return false;

  if (key.length !== secret.length) return false;

  try {
    return timingSafeEqual(Buffer.from(key), Buffer.from(secret));
  } catch {
    return false;
  }
}

export function hasAdminPreviewCookieValue(cookieValue: string | undefined): boolean {
  const secret = process.env.ADMIN_PREVIEW_SECRET;
  if (!secret || !cookieValue) return false;
  return cookieValue === getAdminPreviewCookieValue(secret);
}

export function hasAdminPreviewRequest(request: NextRequest): boolean {
  return hasAdminPreviewCookieValue(request.cookies.get(ADMIN_PREVIEW_COOKIE)?.value);
}

export function getAdminPreviewCookieOptions() {
  const secret = process.env.ADMIN_PREVIEW_SECRET!;
  return {
    name: ADMIN_PREVIEW_COOKIE,
    value: getAdminPreviewCookieValue(secret),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
}
