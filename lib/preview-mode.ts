/** Tijdelijk: platform direct bekijken zonder login. Zet NEXT_PUBLIC_PREVIEW_MODE=false om auth terug te zetten. */
export function isPreviewMode(): boolean {
  return process.env.NEXT_PUBLIC_PREVIEW_MODE !== "false";
}
