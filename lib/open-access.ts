/** Standaard open zonder login. Zet NEXT_PUBLIC_REQUIRE_AUTH=true om login opnieuw te verplichten. */
export function isAuthRequired(): boolean {
  return process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";
}
