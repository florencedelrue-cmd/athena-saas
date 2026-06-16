import { NextResponse } from "next/server";
import { checkRequiredEnv, VERCEL_ENV_REFERENCE } from "@/lib/env";

export async function GET() {
  const result = checkRequiredEnv();

  return NextResponse.json({
    status: result.ok ? "ready" : "missing_config",
    missing: result.missing,
    warnings: result.warnings,
    vercelSetup: VERCEL_ENV_REFERENCE,
    hint: result.ok
      ? "Environment is configured. Deploy to Vercel with the same variables."
      : "Add missing variables in Vercel → Settings → Environment Variables",
  });
}
