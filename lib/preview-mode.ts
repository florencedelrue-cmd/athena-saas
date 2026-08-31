/** Preview zonder login — alleen lokaal in deze browser. Cloud-sync is standaard als Supabase geconfigureerd is. */
export function isPreviewMode(): boolean {
  if (process.env.NEXT_PUBLIC_PREVIEW_MODE === "true") return true;
  if (process.env.NEXT_PUBLIC_PREVIEW_MODE === "false") return false;

  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return !hasSupabase;
}
