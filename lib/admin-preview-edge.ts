import type { NextRequest } from "next/server";

export const ADMIN_PREVIEW_COOKIE = "athena_admin_preview";

async function hashPreviewSecret(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`athena-admin-preview:${secret}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export async function hasAdminPreviewRequest(request: NextRequest): Promise<boolean> {
  const secret = process.env.ADMIN_PREVIEW_SECRET;
  if (!secret) return false;

  const cookie = request.cookies.get(ADMIN_PREVIEW_COOKIE)?.value;
  if (!cookie) return false;

  const expected = await hashPreviewSecret(secret);
  return cookie === expected;
}
