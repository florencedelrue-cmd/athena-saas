import { cookies } from "next/headers";
import { hasAdminPreviewCookieValue, ADMIN_PREVIEW_COOKIE } from "@/lib/admin-preview";

export async function hasAdminPreviewSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return hasAdminPreviewCookieValue(cookieStore.get(ADMIN_PREVIEW_COOKIE)?.value);
}
