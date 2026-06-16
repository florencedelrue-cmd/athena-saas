import { requireAuth } from "@/lib/auth";
import { ensureDemoStudents } from "@/lib/db-server";
import { fetchPlannerDataForSchoolServer } from "@/lib/db-planner-server";
import { AppProvider } from "@/context/AppContext";
import type { LessonPreparation, PlannerEvent } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  const students = await ensureDemoStudents(session.school.id, session.user.id);

  let plannerData: {
    lessonPreparations: LessonPreparation[];
    plannerEvents: PlannerEvent[];
  } = { lessonPreparations: [], plannerEvents: [] };
  try {
    plannerData = await fetchPlannerDataForSchoolServer(session.school.id);
  } catch {
    // Planner-tabellen nog niet gemigreerd
  }

  return (
    <AppProvider
      session={session}
      initialStudents={students}
      initialLessonPreparations={plannerData.lessonPreparations}
      initialPlannerEvents={plannerData.plannerEvents}
    >
      {children}
    </AppProvider>
  );
}
