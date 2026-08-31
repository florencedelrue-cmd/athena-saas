import type { User } from "@supabase/supabase-js";
import { normalizeEmail } from "@/lib/school-domains";

/** E-mail uit Microsoft/Azure OAuth-profiel halen. */
export function getOAuthEmail(user: User): string | null {
  const candidates = [
    user.email,
    user.user_metadata?.email,
    user.user_metadata?.preferred_username,
    user.user_metadata?.upn,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.includes("@")) {
      return normalizeEmail(value);
    }
  }

  return null;
}
