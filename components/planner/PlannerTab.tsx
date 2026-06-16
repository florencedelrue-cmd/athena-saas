"use client";

import { useMemo, useState } from "react";
import { Calendar, Plus, Link2, Pencil, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { MonthCalendar } from "@/components/planner/MonthCalendar";
import { LessonPrepList } from "@/components/planner/LessonPrepList";
import { LessonPrepModal } from "@/components/planner/LessonPrepModal";
import { PlannerEventModal } from "@/components/planner/PlannerEventModal";
import { StudentBadges } from "@/components/planner/StudentMultiSelect";
import { CompetencyBadges } from "@/components/planner/CompetencyMultiSelect";
import { formatDisplayDate, toDateKey } from "@/lib/planner-utils";
import { showToast } from "@/components/ui/Toast";
import type { LessonPreparation, PlannerEvent } from "@/types";

export function PlannerTab() {
  const {
    plannerEvents,
    lessonPreparations,
    createPlannerEvent,
    updatePlannerEvent,
    deletePlannerEvent,
    createLessonPreparation,
    updateLessonPreparation,
    deleteLessonPreparation,
  } = useApp();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateKey(now));

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null);
  const [prepModalOpen, setPrepModalOpen] = useState(false);
  const [editingPrep, setEditingPrep] = useState<LessonPreparation | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingEventAfterPrep, setPendingEventAfterPrep] = useState(false);

  const eventDates = useMemo(
    () => new Set(plannerEvents.map((e) => e.event_date)),
    [plannerEvents]
  );

  const dayEvents = useMemo(
    () =>
      selectedDate
        ? plannerEvents.filter((e) => e.event_date === selectedDate)
        : [],
    [plannerEvents, selectedDate]
  );

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const openNewEvent = () => {
    setEditingEvent(null);
    setEventModalOpen(true);
  };

  const openEditEvent = (event: PlannerEvent) => {
    setEditingEvent(event);
    setEventModalOpen(true);
  };

  const openNewPrep = (afterForEvent = false) => {
    setEditingPrep(null);
    setPendingEventAfterPrep(afterForEvent);
    setPrepModalOpen(true);
  };

  const openEditPrep = (prep: LessonPreparation) => {
    setEditingPrep(prep);
    setPendingEventAfterPrep(false);
    setPrepModalOpen(true);
  };

  const handleSaveEvent = async (data: {
    eventDate: string;
    assignmentTitle: string;
    assignmentNotes: string;
    studentIds: string[];
    lessonPreparationId: string | null;
  }) => {
    setSaving(true);
    try {
      if (editingEvent) {
        await updatePlannerEvent(editingEvent.id, data);
        showToast("Gebeurtenis bijgewerkt.", "success");
      } else {
        await createPlannerEvent(data);
        showToast("Gebeurtenis toegevoegd.", "success");
        setSelectedDate(data.eventDate);
      }
      setEventModalOpen(false);
    } catch {
      showToast("Fout bij opslaan gebeurtenis.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrep = async (data: {
    title: string;
    notes: string;
    competencies: string[];
    studentIds: string[];
  }) => {
    setSaving(true);
    try {
      if (editingPrep) {
        await updateLessonPreparation(editingPrep.id, data);
        showToast("Lesvoorbereiding bijgewerkt.", "success");
      } else {
        await createLessonPreparation(data);
        showToast("Lesvoorbereiding aangemaakt.", "success");
        if (pendingEventAfterPrep) {
          setEventModalOpen(true);
          setEditingEvent(null);
        }
      }
      setPrepModalOpen(false);
      setPendingEventAfterPrep(false);
    } catch {
      showToast("Fout bij opslaan lesvoorbereiding.", "error");
    } finally {
      setSaving(false);
    }
  };

  const getLinkedPrep = (prepId: string | null) =>
    prepId ? lessonPreparations.find((p) => p.id === prepId) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <MonthCalendar
            year={year}
            month={month}
            selectedDate={selectedDate}
            eventDates={eventDates}
            onSelectDate={setSelectedDate}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-athenaBlue" />
                  {selectedDate
                    ? formatDisplayDate(selectedDate)
                    : "Selecteer een dag"}
                </span>
              </div>
              <button
                onClick={openNewEvent}
                disabled={!selectedDate}
                className="bg-athenaBlue hover:bg-opacity-95 text-white font-bold text-xs px-4 py-3 md:py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
                Gebeurtenis toevoegen
              </button>
            </div>

            {dayEvents.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-xs">
                Geen gebeurtenissen op deze dag. Voeg een activiteit toe en
                selecteer welke leerlingen aanwezig waren.
              </p>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((event) => {
                  const linkedPrep = getLinkedPrep(event.lesson_preparation_id);
                  return (
                    <div
                      key={event.id}
                      className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">
                            {event.assignment_title}
                          </h4>
                          {event.assignment_notes && (
                            <p className="text-xs text-slate-500 mt-1">
                              {event.assignment_notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => openEditEvent(event)}
                            className="p-2 text-slate-400 hover:text-athenaBlue rounded-lg hover:bg-white transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("Gebeurtenis verwijderen?")) {
                                await deletePlannerEvent(event.id);
                                showToast("Gebeurtenis verwijderd.", "success");
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {event.student_ids.length > 0 && (
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">
                            Aanwezig:
                          </span>
                          <div className="mt-1">
                            <StudentBadges studentIds={event.student_ids} />
                          </div>
                        </div>
                      )}

                      {linkedPrep && (
                        <div className="border-t border-slate-100 pt-3 space-y-2">
                          <div className="flex items-center gap-1.5 text-athenaBlue">
                            <Link2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase">
                              Gekoppelde lesvoorbereiding
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-700">
                            {linkedPrep.title}
                          </p>
                          {linkedPrep.notes && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {linkedPrep.notes}
                            </p>
                          )}
                          <CompetencyBadges competencyIds={linkedPrep.competencies} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <LessonPrepList
        preparations={lessonPreparations}
        onEdit={openEditPrep}
        onDelete={async (id) => {
          await deleteLessonPreparation(id);
          showToast("Lesvoorbereiding verwijderd.", "success");
        }}
        onCreate={() => openNewPrep(false)}
      />

      <PlannerEventModal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={handleSaveEvent}
        initial={editingEvent}
        defaultDate={selectedDate || undefined}
        saving={saving}
        onCreateLessonPrep={() => {
          setEventModalOpen(false);
          openNewPrep(true);
        }}
      />

      <LessonPrepModal
        open={prepModalOpen}
        onClose={() => {
          setPrepModalOpen(false);
          setPendingEventAfterPrep(false);
        }}
        onSave={handleSavePrep}
        initial={editingPrep}
        saving={saving}
      />
    </div>
  );
}
