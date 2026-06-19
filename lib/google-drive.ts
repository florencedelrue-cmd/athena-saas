import type { DriveMaterialLink } from "@/types";

const DRIVE_HOSTS = [
  "drive.google.com",
  "docs.google.com",
  "sheets.google.com",
  "slides.google.com",
];

export function isGoogleDriveUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return DRIVE_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

/** Normaliseert naar een deelbare view-URL waar mogelijk. */
export function normalizeGoogleDriveUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) {
      return `https://drive.google.com/file/d/${fileMatch[1]}/view`;
    }

    const docMatch = parsed.pathname.match(/\/(document|spreadsheets|presentation)\/d\/([^/]+)/);
    if (docMatch) {
      const type = docMatch[1];
      const id = docMatch[2];
      if (type === "document") return `https://docs.google.com/document/d/${id}/view`;
      if (type === "spreadsheets") return `https://docs.google.com/spreadsheets/d/${id}/view`;
      return `https://docs.google.com/presentation/d/${id}/view`;
    }

    const openId = parsed.searchParams.get("id");
    if (openId && parsed.hostname.includes("drive.google.com")) {
      return `https://drive.google.com/file/d/${openId}/view`;
    }

    return trimmed;
  } catch {
    return trimmed;
  }
}

export function sanitizeDriveLinks(links: DriveMaterialLink[]): DriveMaterialLink[] {
  return links
    .map((link) => ({
      label: link.label.trim(),
      url: normalizeGoogleDriveUrl(link.url),
    }))
    .filter((link) => link.label && link.url && isGoogleDriveUrl(link.url));
}

export function getDriveLinkType(url: string): string {
  if (url.includes("docs.google.com/document")) return "Document";
  if (url.includes("spreadsheets") || url.includes("sheets.google")) return "Spreadsheet";
  if (url.includes("presentation") || url.includes("slides.google")) return "Presentatie";
  if (url.includes("/folders/")) return "Map";
  return "Bestand";
}
