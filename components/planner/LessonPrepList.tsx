"use client";

import { FileText, Pencil, Trash2 } from "lucide-react";
import { CompetencyBadges } from "@/components/planner/CompetencyMultiSelect";
import { StudentBadges } from "@/components/planner/StudentMultiSelect";
import type { LessonPreparation } from "@/types";

interface LessonPrepListProps {
  preparations: LessonPreparation[];
  onEdit: (prep: LessonPreparation) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function LessonPrepList({
  preparations,
  onEdit,
  onDelete,
  onCreate,
}: LessonPrepListProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-athenaBlue" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Lesvoorbereidingen
          </span>
        </div>
        <button
          onClick={onCreate}
          className="bg-athenaBlue/10 hover:bg-athenaBlue/20 text-athenaBlue font-bold text-xs px-4 py-3 md:py-2 rounded-xl transition flex items-center justify-center gap-1.5"
        >
          <FileText className="w-4 h-4" />
          Document toevoegen
        </button>
      </div>

      {preparations.length === 0 ? (
        <p className="text-center py-6 text-slate-400 text-xs">
          Nog geen lesvoorbereidingen. Maak een document aan om onderwerp,
          competenties en leerlingen vast te leggen.
        </p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {preparations.map((prep) => (
            <div
              key={prep.id}
              className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 space-y-2 group"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{prep.title}</h4>
                  {prep.notes && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {prep.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => onEdit(prep)}
                    className="p-2 text-slate-400 hover:text-athenaBlue rounded-lg hover:bg-white transition"
                    title="Bewerken"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Lesvoorbereiding definitief verwijderen?")) {
                        onDelete(prep.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white transition"
                    title="Verwijderen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {prep.competencies.length > 0 && (
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">
                    Competenties:
                  </span>
                  <div className="mt-1">
                    <CompetencyBadges competencyIds={prep.competencies} />
                  </div>
                </div>
              )}
              {prep.student_ids.length > 0 && (
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">
                    Leerlingen:
                  </span>
                  <div className="mt-1">
                    <StudentBadges studentIds={prep.student_ids} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
