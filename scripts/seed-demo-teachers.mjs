#!/usr/bin/env node
/**
 * Maakt demo-leerkrachten aan voor CLW + Heule, incl. leerling-dossiers.
 *
 * Gebruik:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed-demo
 */

import { createClient } from "@supabase/supabase-js";
import { seedSchoolDemoData } from "./lib/demo-seed.mjs";

const DEMO_PASSWORD = "AthenaDemo2026!";

const DEMO_TEACHERS = [
  { email: "els.vermeulen@athena-clw.be", domain: "athena-clw.be", name: "Athena CLW" },
  { email: "marie.claes@athena-heule.be", domain: "athena-heule.be", name: "Athena Heule" },
];

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("\n❌ Zet SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY\n");
  process.exit(1);
}

const supabase = createClient(url, key);

async function findUserByEmail(email) {
  let page = 1;
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < 200) break;
    page++;
  }
  return null;
}

async function ensureSchool(domain, name) {
  let { data: school } = await supabase
    .from("schools")
    .select("id, name")
    .eq("email_domain", domain)
    .maybeSingle();

  if (!school) {
    const { data: created, error } = await supabase
      .from("schools")
      .insert({
        name,
        plan: "pro",
        email_domain: domain,
        subscription_status: "active",
      })
      .select("id, name")
      .single();
    if (error) throw error;
    school = created;
    console.log(`   🏫 School aangemaakt: ${name}`);
  }
  return school;
}

async function provisionTeacher(email, domain, schoolName) {
  const school = await ensureSchool(domain, schoolName);
  let authUser = await findUserByEmail(email);

  if (authUser) {
    const { error } = await supabase.auth.admin.updateUserById(authUser.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    console.log(`   ♻️  Bestaand account bijgewerkt: ${email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    authUser = data.user;
    console.log(`   ✅ Nieuw account aangemaakt: ${email}`);
  }

  const { error: userError } = await supabase.from("users").upsert(
    {
      id: authUser.id,
      email,
      school_id: school.id,
      role: "teacher",
    },
    { onConflict: "id" }
  );
  if (userError) throw userError;

  const coachName = email.includes("clw") ? "Els Vermeulen" : "Marie Claes";
  await seedSchoolDemoData(supabase, school.id, authUser.id, coachName);

  return { email, school: school.name };
}

console.log("\n🌱 Demo-leerkrachten seeden...\n");

const results = [];
for (const t of DEMO_TEACHERS) {
  console.log(`→ ${t.email}`);
  try {
    const r = await provisionTeacher(t.email, t.domain, t.name);
    results.push(r);
  } catch (err) {
    console.error(`   ❌ Mislukt: ${err.message}`);
    process.exit(1);
  }
}

console.log("\n" + "═".repeat(52));
console.log("  DEMO ACCOUNTS — klaar voor presentatie");
console.log("═".repeat(52));
console.log(`  Wachtwoord (beide):  ${DEMO_PASSWORD}\n`);
for (const r of results) {
  console.log(`  📧 ${r.email}`);
  console.log(`     Campus: ${r.school}\n`);
}
console.log("  Login: https://jouw-app.vercel.app/login");
console.log("═".repeat(52) + "\n");
