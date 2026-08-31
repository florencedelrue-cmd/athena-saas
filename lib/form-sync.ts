/** Voorkomt dat live-updates van andere leerkrachten lokaal getypte tekst overschrijven. */
export function isUserEditing(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select";
}
