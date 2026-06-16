"use client";

import { X, Calendar, Save, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { StudentMultiSelect } from "@/components/planner/StudentMultiSelect";
import { useApp } from "@/context/AppContext";
import type { PlannerEvent } from "@/types";

export interface PlannerEventFormData {
  eventDate: string;
  assignmentTitle: string;
  assignmentNotes: string;
  studentIds: string[];
  lessonPreparationId: string | null;
}

interface PlannerEventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PlannerEventFormData) => Promise<void>;
  initial?: PlannerEvent | null;
  defaultDate?: string;
  saving?: boolean;
  onCreateLessonPrep?: () => void;
}

export function PlannerEventModal({
  open,
  onClose,
  onSave,
  initial,
  defaultDate,
  saving = false,
  onCreateLessonPrep,
}: PlannerEventModalProps) {
  const { lessonPreparations } = useApp();
  const [eventDate, setEventDate] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [lessonPreparationId, setLessonPreparationId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEventDate(initial?.event_date || defaultDate || "");
      setAssignmentTitle(initial?.assignment_title || "");
      setAssignmentNotes(initial?.assignment_notes || "");
      setStudentIds(initial?.student_ids || []);
      setLessonPreparationId(initial?.lesson_preparation_id || null);
    }
  }, [open, initial, defaultDate]);

  useEffect(() => {
    if (!lessonPreparationId) return;
    const prep = lessonPreparations.find((p) => p.id === lessonPreparationId);
    if (prep && !initial) {
      setAssignmentTitle((prev) => prev || prep.title);
      if (studentIds.length === 0) setStudentIds(prep.student_ids);
    }
  }, [lessonPreparationId, lessonPreparations, initial, studentIds.length]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate || !assignmentTitle.trim()) return;
    await onSave({
      eventDate,
      assignmentTitle: assignmentTitle.trim(),
      assignmentNotes,
      studentIds,
      lessonPreparationId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 md:px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2 text-athenaBlue">
            <Calendar className="w-5 h-5" />
            <h2 className="font-bold text-sm text-slate-800">
              {initial ? "Gebeurtenis bewerken" : "Nieuwe planner-gebeurtenis"}
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
              Datum *
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:border-athenaBlue outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Opdracht / Activiteit *
            </label>
            <input
              type="text"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              required
              placeholder="Waar werkten de leerlingen aan?"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:border-athenaBlue outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Extra notities
            </label>
            <textarea
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              rows={3}
              placeholder="Optionele toelichting..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-athenaBlue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Aanwezige leerlingen
            </label>
            <StudentMultiSelect selectedIds={studentIds} onChange={setStudentIds} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-500">
                Gekoppelde lesvoorbereiding
              </label>
              {onCreateLessonPrep && (
                <button
                  type="button"
                  onClick={onCreateLessonPrep}
                  className="text-[10px] text-athenaBlue font-bold flex items-center gap-1 hover:underline"
                >
                  <Link2 className="w-3 h-3" />
                  Nieuw document
                </button>
              )}
            </div>
            <select
              value={lessonPreparationId || ""}
              onChange={(e) =>
                setLessonPreparationId(e.target.value || null)
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:border-athenaBlue outline-none"
            >
              <option value="">— Geen koppeling —</option>
              {lessonPreparations.map((prep) => (
                <option key={prep.id} value={prep.id}>
                  {prep.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving || !eventDate || !assignmentTitle.trim()}
            className="w-full bg-athenaBlue hover:bg-opacity-95 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Opslaan..." : initial ? "Bijwerken" : "Gebeurtenis opslaan"}
          </button>
        </form>
      </div>
    </div>
  );
}
