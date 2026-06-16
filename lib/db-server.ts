import { createClient } from "@/lib/server";
import { fetchStudentsForSchoolServer } from "@/lib/db";
import { seedDemoData } from "@/lib/demo-seed";
import type { StudentWithData } from "@/types";

export async function fetchStudentsForSchoolServerLayout(
  schoolId: string
): Promise<StudentWithData[]> {
  const supabase = await createClient();
  return fetchStudentsForSchoolServer(supabase, schoolId);
}

export async function ensureDemoStudents(
  schoolId: string,
  userId: string
): Promise<StudentWithData[]> {
  const supabase = await createClient();
  let students = await fetchStudentsForSchoolServer(supabase, schoolId);

  if (students.length === 0) {
    const demo = await seedDemoData(supabase, schoolId, userId);
    if (demo) students = [demo];
  }

  return students;
}
