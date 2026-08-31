import { formatDateToDisplay } from "@/lib/db";
import type { LessonPreparation, Log, PlannerEvent, StudentWithData } from "@/types";

export function getCompetenciesForPlannerEvent(
  event: PlannerEvent,
  lessonPreparations: LessonPreparation[]
): string[] {
  if (!event.lesson_preparation_id) return [];
  const prep = lessonPreparations.find((p) => p.id === event.lesson_preparation_id);
  return prep?.competencies ?? [];
}

function buildPlannerLogFields(event: PlannerEvent, competencies: string[]) {
  return {
    date: formatDateToDisplay(event.event_date),
    title: event.assignment_title,
    content:
      event.assignment_notes?.trim() ||
      "Aanwezig op geplande activiteit (PLANNER LKR).",
    competencies_used: competencies,
  };
}

export function applyPlannerEventLogsToStudents(
  students: StudentWithData[],
  event: PlannerEvent,
  competencies: string[]
): StudentWithData[] {
  const fields = buildPlannerLogFields(event, competencies);

  return students.map((student) => {
    const logsWithoutEvent = student.logs.filter((l) => l.planner_event_id !== event.id);

    if (!event.student_ids.includes(student.id)) {
      return { ...student, logs: logsWithoutEvent };
    }

    const log: Log = {
      id: `planner-log-${event.id}-${student.id}`,
      student_id: student.id,
      planner_event_id: event.id,
      ...fields,
    };

    return { ...student, logs: [log, ...logsWithoutEvent] };
  });
}

export function removePlannerEventLogsFromStudents(
  students: StudentWithData[],
  eventId: string
): StudentWithData[] {
  return students.map((student) => ({
    ...student,
    logs: student.logs.filter((log) => log.planner_event_id !== eventId),
  }));
}
