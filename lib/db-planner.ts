import { createClient } from "@/lib/supabase";
import type { LessonPreparation, PlannerEvent } from "@/types";

export async function fetchPlannerDataForSchool(schoolId: string): Promise<{
  lessonPreparations: LessonPreparation[];
  plannerEvents: PlannerEvent[];
}> {
  const supabase = createClient();

  const [prepsRes, eventsRes] = await Promise.all([
    supabase
      .from("lesson_preparations")
      .select("*")
      .eq("school_id", schoolId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("planner_events")
      .select("*")
      .eq("school_id", schoolId)
      .order("event_date", { ascending: false }),
  ]);

  if (prepsRes.error) throw prepsRes.error;
  if (eventsRes.error) throw eventsRes.error;

  return {
    lessonPreparations: (prepsRes.data || []) as LessonPreparation[],
    plannerEvents: (eventsRes.data || []) as PlannerEvent[],
  };
}

export async function createLessonPreparationInDb(params: {
  schoolId: string;
  createdBy: string;
  title: string;
  notes?: string;
  competencies: string[];
  studentIds: string[];
}): Promise<LessonPreparation> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("lesson_preparations")
    .insert({
      school_id: params.schoolId,
      created_by: params.createdBy,
      title: params.title,
      notes: params.notes || "",
      competencies: params.competencies,
      student_ids: params.studentIds,
    })
    .select()
    .single();

  if (error) throw error;
  return data as LessonPreparation;
}

export async function updateLessonPreparationInDb(
  id: string,
  updates: Partial<
    Pick<LessonPreparation, "title" | "notes" | "competencies" | "student_ids">
  >
): Promise<LessonPreparation> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("lesson_preparations")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as LessonPreparation;
}

export async function deleteLessonPreparationFromDb(id: string): Promise<void> {
  const supabase = createClient();

  await supabase
    .from("planner_events")
    .update({ lesson_preparation_id: null })
    .eq("lesson_preparation_id", id);

  const { error } = await supabase.from("lesson_preparations").delete().eq("id", id);
  if (error) throw error;
}

export async function createPlannerEventInDb(params: {
  schoolId: string;
  eventDate: string;
  assignmentTitle: string;
  assignmentNotes?: string;
  lessonPreparationId?: string | null;
  studentIds: string[];
}): Promise<PlannerEvent> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("planner_events")
    .insert({
      school_id: params.schoolId,
      event_date: params.eventDate,
      assignment_title: params.assignmentTitle,
      assignment_notes: params.assignmentNotes || "",
      lesson_preparation_id: params.lessonPreparationId || null,
      student_ids: params.studentIds,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PlannerEvent;
}

export async function updatePlannerEventInDb(
  id: string,
  updates: Partial<
    Pick<
      PlannerEvent,
      | "event_date"
      | "assignment_title"
      | "assignment_notes"
      | "lesson_preparation_id"
      | "student_ids"
    >
  >
): Promise<PlannerEvent> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("planner_events")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PlannerEvent;
}

export async function deletePlannerEventFromDb(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("planner_events").delete().eq("id", id);
  if (error) throw error;
}
