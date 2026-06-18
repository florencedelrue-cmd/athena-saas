import { requireAuth } from "@/lib/auth";
import { ensureDemoStudents } from "@/lib/db-server";
import { fetchPlannerDataForSchoolServer } from "@/lib/db-planner-server";
import {
  getPreviewPlannerData,
  getPreviewSession,
  getPreviewStudents,
} from "@/lib/demo-preview-data";
import { isPreviewMode } from "@/lib/preview-mode";
import { AppProvider } from "@/context/AppContext";
import type { LessonPreparation, PlannerEvent } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isPreviewMode()) {
    const session = getPreviewSession();
    const plannerData = getPreviewPlannerData();

    return (
      <AppProvider
        previewMode
        session={session}
        initialStudents={getPreviewStudents()}
        initialLessonPreparations={plannerData.lessonPreparations}
        initialPlannerEvents={plannerData.plannerEvents}
      >
        {children}
      </AppProvider>
    );
  }

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
