"use client";

import { ExternalLink, FolderOpen, Plus, Trash2 } from "lucide-react";
import { isGoogleDriveUrl } from "@/lib/google-drive";
import type { DriveMaterialLink } from "@/types";

interface DriveLinksEditorProps {
  links: DriveMaterialLink[];
  onChange: (links: DriveMaterialLink[]) => void;
}

function emptyLink(): DriveMaterialLink {
  return { label: "", url: "" };
}

export function DriveLinksEditor({ links, onChange }: DriveLinksEditorProps) {
  const updateLink = (index: number, field: keyof DriveMaterialLink, value: string) => {
    onChange(links.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FolderOpen className="w-4 h-4 text-athenaBlue" />
        <span className="text-xs font-semibold text-slate-500">
          Cursusmateriaal / documentatie (Google Drive)
        </span>
      </div>
      <p className="text-[10px] text-slate-400 leading-relaxed">
        Plak een deelbare link van Google Drive, Docs, Sheets of Slides. Zorg dat leerlingen
        toegang hebben via de school.
      </p>

      {links.length === 0 ? (
        <p className="text-[11px] text-slate-400 italic py-1">
          Nog geen Drive-links gekoppeld.
        </p>
      ) : (
        <div className="space-y-2">
          {links.map((link, index) => {
            const urlInvalid = link.url.trim().length > 0 && !isGoogleDriveUrl(link.url);
            return (
              <div
                key={index}
                className="border border-slate-200 bg-slate-50/80 rounded-xl p-3 space-y-2"
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Link {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white transition"
                    title="Verwijderen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink(index, "label", e.target.value)}
                  placeholder="Bijv. EHBO-handleiding, Werkblad veiligheid..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:border-athenaBlue outline-none"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(index, "url", e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className={`w-full bg-white border rounded-xl px-3 py-2 text-sm text-slate-800 focus:border-athenaBlue outline-none ${
                    urlInvalid ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {urlInvalid && (
                  <p className="text-[10px] text-red-500">
                    Gebruik een geldige Google Drive- of Google Docs-link.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => onChange([...links, emptyLink()])}
        className="w-full border border-dashed border-athenaBlue/30 hover:border-athenaBlue/50 text-athenaBlue font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        Drive-link toevoegen
      </button>
    </div>
  );
}

interface DriveMaterialBadgesProps {
  links: DriveMaterialLink[];
  compact?: boolean;
}

export function DriveMaterialBadges({ links, compact = false }: DriveMaterialBadgesProps) {
  if (!links.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? "" : "mt-1"}`}>
      {links.map((link, index) => (
        <a
          key={`${link.url}-${index}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[9px] px-2 py-1 rounded-full transition max-w-full"
          title={link.url}
        >
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{link.label}</span>
        </a>
      ))}
    </div>
  );
}
