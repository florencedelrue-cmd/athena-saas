#!/usr/bin/env node
/**
 * Pre-deploy check: node scripts/check-env.mjs
 * Validates required environment variables before Vercel deploy.
 */

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const recommended = ["NEXT_PUBLIC_APP_URL"];

const missing = required.filter((key) => !process.env[key]);
const warn = recommended.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("\n❌ Ontbrekende verplichte environment variables:\n");
  missing.forEach((key) => console.error(`   • ${key}`));
  console.error("\n→ Vercel: Project → Settings → Environment Variables\n");
  console.error("→ Lokaal: kopieer .env.local.example naar .env.local\n");
  process.exit(1);
}

console.log("\n✅ Alle verplichte environment variables zijn ingesteld.\n");

if (warn.length > 0) {
  console.warn("⚠️  Aanbevolen (nog niet ingesteld):");
  warn.forEach((key) => console.warn(`   • ${key}`));
  console.warn("");
}

if (process.env.NEXT_PUBLIC_APP_URL?.includes("localhost")) {
  console.warn("⚠️  NEXT_PUBLIC_APP_URL wijst naar localhost.");
  console.warn("   Zet op productie: https://jouw-app.vercel.app\n");
}

console.log("Klaar voor deploy.\n");
