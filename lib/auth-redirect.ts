/** Callback-URL voor Supabase OAuth (Microsoft). */
export function getAuthCallbackUrl(origin?: string): string {
  const base =
    origin ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  return `${base.replace(/\/$/, "")}/auth/callback`;
}
