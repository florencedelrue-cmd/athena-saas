"use client";

import { X, FileText, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { StudentMultiSelect } from "@/components/planner/StudentMultiSelect";
import { CompetencyMultiSelect } from "@/components/planner/CompetencyMultiSelect";
import { DriveLinksEditor } from "@/components/planner/DriveLinksEditor";
import { sanitizeDriveLinks } from "@/lib/google-drive";
import type { DriveMaterialLink, LessonPreparation } from "@/types";

export interface LessonPrepFormData {
  title: string;
  notes: string;
  competencies: string[];
  studentIds: string[];
  driveLinks: DriveMaterialLink[];
}

interface LessonPrepModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: LessonPrepFormData) => Promise<void>;
  initial?: LessonPreparation | null;
  saving?: boolean;
}

export function LessonPrepModal({
  open,
  onClose,
  onSave,
  initial,
  saving = false,
}: LessonPrepModalProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [driveLinks, setDriveLinks] = useState<DriveMaterialLink[]>([]);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title || "");
      setNotes(initial?.notes || "");
      setCompetencies(initial?.competencies || []);
      setStudentIds(initial?.student_ids || []);
      setDriveLinks(initial?.drive_links?.length ? [...initial.drive_links] : []);
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSave({
      title: title.trim(),
      notes,
      competencies,
      studentIds,
      driveLinks: sanitizeDriveLinks(driveLinks),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 md:px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2 text-athenaBlue">
            <FileText className="w-5 h-5" />
            <h2 className="font-bold text-sm text-slate-800">
              {initial ? "Lesvoorbereiding bewerken" : "Nieuwe lesvoorbereiding"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Onderwerp van de les *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Bijv. Veiligheid op de werkplek..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:border-athenaBlue outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Notities / Lesinhoud
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Beschrijf de lesstructuur, leerdoelen, materialen..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-athenaBlue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Gekoppelde competenties
            </label>
            <CompetencyMultiSelect
              selectedIds={competencies}
              onChange={setCompetencies}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Aanwezige leerlingen
            </label>
            <StudentMultiSelect selectedIds={studentIds} onChange={setStudentIds} />
          </div>

          <DriveLinksEditor links={driveLinks} onChange={setDriveLinks} />

          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="w-full bg-athenaBlue hover:bg-opacity-95 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 sticky bottom-0"
          >
            <Save className="w-4 h-4" />
            {saving ? "Opslaan..." : initial ? "Bijwerken" : "Document aanmaken"}
          </button>
        </form>
      </div>
    </div>
  );
}
