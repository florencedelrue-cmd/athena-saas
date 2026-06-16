/**
 * Environment variable configuration for Athena TOCI 2.0
 * Used locally (.env.local) and on Vercel (Project → Settings → Environment Variables)
 */

export const ENV = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
} as const;

export type EnvCheckResult = {
  ok: boolean;
  missing: string[];
  warnings: string[];
};

/** Required for the app to run */
export function checkRequiredEnv(): EnvCheckResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!ENV.supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!ENV.supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!ENV.supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (!ENV.appUrl || ENV.appUrl.includes("localhost")) {
    warnings.push(
      "NEXT_PUBLIC_APP_URL is localhost — set to your Vercel URL in production"
    );
  }

  if (!ENV.stripeSecretKey) {
    warnings.push("STRIPE_SECRET_KEY not set (billing prep only, optional for demo)");
  }

  return { ok: missing.length === 0, missing, warnings };
}

/** Copy-paste reference for Vercel dashboard */
export const VERCEL_ENV_REFERENCE = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", scope: "Production, Preview, Development", required: true },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", scope: "Production, Preview, Development", required: true },
  { key: "SUPABASE_SERVICE_ROLE_KEY", scope: "Production, Preview", required: true },
  { key: "NEXT_PUBLIC_APP_URL", scope: "Production", required: true, example: "https://athena-duaal.vercel.app" },
  { key: "STRIPE_SECRET_KEY", scope: "Production", required: false },
  { key: "STRIPE_PRO_PRICE_ID", scope: "Production", required: false },
] as const;
