import { getUser, requireAuth } from "@/lib/auth";
import { isAuthRequired } from "@/lib/open-access";
import { ensureDemoStudents } from "@/lib/db-server";
import { fetchPlannerDataForSchoolServer } from "@/lib/db-planner-server";
import {
  getPreviewPlannerData,
  getPreviewSession,
  getPreviewStudents,
} from "@/lib/demo-preview-data";
import { isPreviewMode } from "@/lib/preview-mode";
import { hasAdminPreviewSession } from "@/lib/admin-preview-server";
import { AppProvider } from "@/context/AppContext";
import type { LessonPreparation, PlannerEvent } from "@/types";

async function renderPreviewProvider(children: React.ReactNode) {
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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminPreview = await hasAdminPreviewSession();

  if (isPreviewMode() || adminPreview) {
    return renderPreviewProvider(children);
  }

  if (!isAuthRequired()) {
    const guestSession = await getUser();
    if (guestSession) {
      const students = await ensureDemoStudents(
        guestSession.school.id,
        guestSession.user.id
      );

      let plannerData: {
        lessonPreparations: LessonPreparation[];
        plannerEvents: PlannerEvent[];
      } = { lessonPreparations: [], plannerEvents: [] };
      try {
        plannerData = await fetchPlannerDataForSchoolServer(guestSession.school.id);
      } catch {
        // Planner-tabellen nog niet gemigreerd
      }

      return (
        <AppProvider
          session={guestSession}
          initialStudents={students}
          initialLessonPreparations={plannerData.lessonPreparations}
          initialPlannerEvents={plannerData.plannerEvents}
        >
          {children}
        </AppProvider>
      );
    }

    return renderPreviewProvider(children);
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
