import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

type RealtimeCallback = () => void;

interface RealtimeSubscription {
  unsubscribe: () => void;
}

/**
 * Prepared structure for Supabase Realtime subscriptions.
 * Enable realtime on tables in Supabase dashboard before using.
 */
export function subscribeToSchoolData(
  supabase: SupabaseClient<Database>,
  schoolId: string,
  callbacks: {
    onStudentsChange?: RealtimeCallback;
    onLogsChange?: RealtimeCallback;
    onCompetenciesChange?: RealtimeCallback;
  }
): RealtimeSubscription[] {
  const subscriptions: RealtimeSubscription[] = [];

  if (callbacks.onStudentsChange) {
    const channel = supabase
      .channel(`realtime:students:${schoolId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "students",
          filter: `school_id=eq.${schoolId}`,
        },
        () => callbacks.onStudentsChange?.()
      )
      .subscribe();

    subscriptions.push({
      unsubscribe: () => supabase.removeChannel(channel),
    });
  }

  if (callbacks.onLogsChange) {
    const channel = supabase
      .channel(`realtime:logs:${schoolId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "logs" },
        () => callbacks.onLogsChange?.()
      )
      .subscribe();

    subscriptions.push({
      unsubscribe: () => supabase.removeChannel(channel),
    });
  }

  if (callbacks.onCompetenciesChange) {
    const channel = supabase
      .channel(`realtime:competencies:${schoolId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "competencies" },
        () => callbacks.onCompetenciesChange?.()
      )
      .subscribe();

    subscriptions.push({
      unsubscribe: () => supabase.removeChannel(channel),
    });
  }

  return subscriptions;
}

export function unsubscribeAll(subscriptions: RealtimeSubscription[]): void {
  subscriptions.forEach((sub) => sub.unsubscribe());
}
