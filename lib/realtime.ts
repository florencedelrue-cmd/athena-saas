import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

type RealtimeCallback = () => void;

interface RealtimeSubscription {
  unsubscribe: () => void;
}

/**
 * Supabase Realtime voor gedeelde schooldata.
 * Run supabase/migrations/005_enable_realtime.sql in Supabase eerst.
 */
export function subscribeToSchoolData(
  supabase: SupabaseClient<Database>,
  schoolId: string,
  callbacks: {
    onStudentsChange?: RealtimeCallback;
    onFichesChange?: RealtimeCallback;
    onLogsChange?: RealtimeCallback;
    onCompetenciesChange?: RealtimeCallback;
    onLessonPreparationsChange?: RealtimeCallback;
    onPlannerEventsChange?: RealtimeCallback;
  }
): RealtimeSubscription[] {
  const subscriptions: RealtimeSubscription[] = [];

  const addChannel = (
    name: string,
    table: string,
    callback: RealtimeCallback | undefined,
    filter?: string
  ) => {
    if (!callback) return;

    const config: {
      event: "*";
      schema: "public";
      table: string;
      filter?: string;
    } = { event: "*", schema: "public", table };

    if (filter) config.filter = filter;

    const channel = supabase
      .channel(`realtime:${name}:${schoolId}`)
      .on("postgres_changes", config, () => callback())
      .subscribe();

    subscriptions.push({
      unsubscribe: () => supabase.removeChannel(channel),
    });
  };

  addChannel("students", "students", callbacks.onStudentsChange, `school_id=eq.${schoolId}`);
  addChannel("fiches", "fiches", callbacks.onFichesChange);
  addChannel("logs", "logs", callbacks.onLogsChange);
  addChannel("competencies", "competencies", callbacks.onCompetenciesChange);
  addChannel(
    "lesson_preparations",
    "lesson_preparations",
    callbacks.onLessonPreparationsChange,
    `school_id=eq.${schoolId}`
  );
  addChannel(
    "planner_events",
    "planner_events",
    callbacks.onPlannerEventsChange,
    `school_id=eq.${schoolId}`
  );

  return subscriptions;
}

export function unsubscribeAll(subscriptions: RealtimeSubscription[]): void {
  subscriptions.forEach((sub) => sub.unsubscribe());
}
