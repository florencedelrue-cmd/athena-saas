#!/usr/bin/env node
/**
 * Leerkracht-account aanmaken (door beheerder).
 *
 * Gebruik:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/provision-teacher.mjs voornaam.naam@athena-clw.be TijdelijkWachtwoord123
 *
 * Domeinen: @athena-clw.be | @athena-heule.be
 */

import { createClient } from "@supabase/supabase-js";

const ALLOWED = ["athena-clw.be", "athena-heule.be"];
const SCHOOL_NAMES = {
  "athena-clw.be": "Athena CLW",
  "athena-heule.be": "Athena Heule",
};

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const [emailArg, password] = process.argv.slice(2);

if (!url || !key) {
  console.error("\n❌ Zet SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY\n");
  process.exit(1);
}

if (!emailArg || !password) {
  console.error("\nGebruik: node scripts/provision-teacher.mjs email@athena-clw.be Wachtwoord\n");
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const domain = email.split("@")[1];

if (!ALLOWED.includes(domain)) {
  console.error(`\n❌ Alleen ${ALLOWED.join(" of ")} toegestaan.\n`);
  process.exit(1);
}

const supabase = createClient(url, key);

let { data: school } = await supabase
  .from("schools")
  .select("id, name")
  .eq("email_domain", domain)
  .maybeSingle();

if (!school) {
  const { data: created, error } = await supabase
    .from("schools")
    .insert({
      name: SCHOOL_NAMES[domain],
      plan: "pro",
      email_domain: domain,
      subscription_status: "active",
    })
    .select("id, name")
    .single();
  if (error) {
    console.error("School aanmaken mislukt:", error.message);
    process.exit(1);
  }
  school = created;
}

const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (authError) {
  console.error("Auth user mislukt:", authError.message);
  process.exit(1);
}

const { error: userError } = await supabase.from("users").upsert(
  {
    id: authData.user.id,
    email,
    school_id: school.id,
    role: "teacher",
  },
  { onConflict: "id" }
);

if (userError) {
  console.error("Users record mislukt:", userError.message);
  process.exit(1);
}

console.log(`\n✅ Leerkracht aangemaakt: ${email}`);
console.log(`   School: ${school.name}`);
console.log(`   Login: voornaam.naam@${domain}\n`);
