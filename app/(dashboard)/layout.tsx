import { requireAuth } from "@/lib/auth";
import {
  fetchStudentsForSchoolServer,
  createStudentInDbServer,
} from "@/lib/db-server";
import { AppProvider } from "@/context/AppContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  let students = await fetchStudentsForSchoolServer(session.school.id);

  if (students.length === 0) {
    const defaultStudent = await createStudentInDbServer({
      schoolId: session.school.id,
      name: "Nieuw Leerlingdossier",
      class: "5 Elektrotechnieken Duaal",
      schoolYear: "2026-2027",
      coach: "",
    });
    students = [defaultStudent];
  }

  return (
    <AppProvider session={session} initialStudents={students}>
      {children}
    </AppProvider>
  );
}
