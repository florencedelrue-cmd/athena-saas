import { createClient } from "@/lib/server";
import type { LessonPreparation, PlannerEvent } from "@/types";

export async function fetchPlannerDataForSchoolServer(schoolId: string): Promise<{
  lessonPreparations: LessonPreparation[];
  plannerEvents: PlannerEvent[];
}> {
  const supabase = await createClient();

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
