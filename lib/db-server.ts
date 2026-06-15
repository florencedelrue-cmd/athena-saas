import { createClient } from "@/lib/server";
import {
  ALL_COMPETENCY_KEYS,
  DEFAULT_COMPETENCY_SCORE,
} from "@/lib/constants";
import type {
  Competency,
  Fiche,
  Log,
  Student,
  StudentWithData,
} from "@/types";

function assembleStudentData(
  student: Student,
  fiches: Fiche[],
  competencies: Competency[],
  logs: Log[]
): StudentWithData {
  return { ...student, fiches, competencies, logs };
}

export async function fetchStudentsForSchoolServer(
  schoolId: string
): Promise<StudentWithData[]> {
  const supabase = await createClient();

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: true });

  if (studentsError) throw studentsError;
  if (!students || students.length === 0) return [];

  const studentIds = students.map((s) => s.id);

  const [fichesRes, competenciesRes, logsRes] = await Promise.all([
    supabase.from("fiches").select("*").in("student_id", studentIds),
    supabase.from("competencies").select("*").in("student_id", studentIds),
    supabase
      .from("logs")
      .select("*")
      .in("student_id", studentIds)
      .order("date", { ascending: false }),
  ]);

  if (fichesRes.error) throw fichesRes.error;
  if (competenciesRes.error) throw competenciesRes.error;
  if (logsRes.error) throw logsRes.error;

  return students.map((student) =>
    assembleStudentData(
      student as Student,
      (fichesRes.data || []).filter((f) => f.student_id === student.id) as Fiche[],
      (competenciesRes.data || []).filter((c) => c.student_id === student.id) as Competency[],
      (logsRes.data || []).filter((l) => l.student_id === student.id) as Log[]
    )
  );
}

export async function createStudentInDbServer(params: {
  schoolId: string;
  name: string;
  class?: string;
  schoolYear?: string;
  coach?: string;
}): Promise<StudentWithData> {
  const supabase = await createClient();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({
      school_id: params.schoolId,
      name: params.name,
      class: params.class || "5 Elektrotechnieken Duaal",
      school_year: params.schoolYear || "2026-2027",
      coach: params.coach || "",
      process_step: 1,
    })
    .select()
    .single();

  if (studentError) throw studentError;

  const competencyRows = ALL_COMPETENCY_KEYS.map((key) => ({
    student_id: student.id,
    competency_key: key,
    score: DEFAULT_COMPETENCY_SCORE,
  }));

  const { error: compError } = await supabase.from("competencies").insert(competencyRows);
  if (compError) throw compError;

  const defaultFiches = [
    { student_id: student.id, fase: 1, data: { feedUp: "", feedback: "", feedForward: "" } },
    { student_id: student.id, fase: 2, data: { klassenraad: "", gesprek: "", iopFocus: [] } },
    { student_id: student.id, fase: 5, data: { klassenraad: "", advies: "" } },
  ];

  const { data: fiches, error: ficheError } = await supabase
    .from("fiches")
    .insert(defaultFiches)
    .select();

  if (ficheError) throw ficheError;

  const { data: competencies } = await supabase
    .from("competencies")
    .select("*")
    .eq("student_id", student.id);

  return assembleStudentData(
    student as Student,
    (fiches || []) as Fiche[],
    (competencies || []) as Competency[],
    []
  );
}
