/**
 * Gedeelde demo-leerkracht accounts voor presentatie & testing.
 * Wachtwoord alleen via seed-script — nooit in client code.
 */
export const DEMO_TEACHER_PASSWORD = "AthenaDemo2026!";

export const DEMO_TEACHERS = [
  {
    email: "els.vermeulen@athena-clw.be",
    school: "Athena CLW",
    domain: "athena-clw.be",
    label: "Demo CLW (koppelt aan coach Els Vermeulen in demo-data)",
  },
  {
    email: "marie.claes@athena-heule.be",
    school: "Athena Heule",
    domain: "athena-heule.be",
    label: "Demo Heule",
  },
] as const;
