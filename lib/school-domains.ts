export const ALLOWED_EMAIL_DOMAINS = ["athena-clw.be", "athena-heule.be"] as const;

export type AllowedEmailDomain = (typeof ALLOWED_EMAIL_DOMAINS)[number];

export const SCHOOL_CONFIG: Record<
  AllowedEmailDomain,
  { name: string; shortName: string }
> = {
  "athena-clw.be": { name: "Athena CLW", shortName: "CLW" },
  "athena-heule.be": { name: "Athena Heule", shortName: "Heule" },
};

export function getEmailDomain(email: string): string | null {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return parts[1];
}

export function isAllowedTeacherEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) return false;
  return ALLOWED_EMAIL_DOMAINS.includes(domain as AllowedEmailDomain);
}

export function getSchoolNameForEmail(email: string): string | null {
  const domain = getEmailDomain(email);
  if (!domain || !(domain in SCHOOL_CONFIG)) return null;
  return SCHOOL_CONFIG[domain as AllowedEmailDomain].name;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
