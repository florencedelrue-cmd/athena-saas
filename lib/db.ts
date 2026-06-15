import { createClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ALL_COMPETENCY_KEYS,
  DEFAULT_COMPETENCY_SCORE,
} from "@/lib/constants";
import type {
  AnalyseNotes,
  Competency,
  CompetencyScore,
  DoorstroomNotes,
  Fiche,
  Log,
  ScreeningNotes,
  Student,
  StudentWithData,
} from "@/types";

function getFicheData<T>(fiches: Fiche[], fase: number, fallback: T): T {
  const fiche = fiches.find((f) => f.fase === fase);
  if (!fiche || !fiche.data) return fallback;
  return fiche.data as T;
}

export function assembleStudentData(
  student: Student,
  fiches: Fiche[],
  competencies: Competency[],
  logs: Log[]
): StudentWithData {
  return {
    ...student,
    fiches,
    competencies,
    logs,
  };
}

export function getScreeningNotes(fiches: Fiche[]): ScreeningNotes {
  return getFicheData(fiches, 1, { feedUp: "", feedback: "", feedForward: "" });
}

export function getAnalyseNotes(fiches: Fiche[]): AnalyseNotes {
  return getFicheData(fiches, 2, { klassenraad: "", gesprek: "", iopFocus: [] });
}

export function getDoorstroomNotes(fiches: Fiche[]): DoorstroomNotes {
  return getFicheData(fiches, 5, { klassenraad: "", advies: "" });
}

export function getAssessments(competencies: Competency[]): Record<string, CompetencyScore> {
  const assessments: Record<string, CompetencyScore> = {};
  ALL_COMPETENCY_KEYS.forEach((key) => {
    assessments[key] = { ...DEFAULT_COMPETENCY_SCORE };
  });
  competencies.forEach((comp) => {
    assessments[comp.competency_key] = comp.score;
  });
  return assessments;
}

export async function fetchStudentsForSchool(schoolId: string): Promise<StudentWithData[]> {
  const supabase = createClient();
  return fetchStudentsForSchoolServer(supabase, schoolId);
}

export async function fetchStudentsForSchoolServer(
  supabase: SupabaseClient,
  schoolId: string
): Promise<StudentWithData[]> {

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
    supabase.from("logs").select("*").in("student_id", studentIds).order("date", { ascending: false }),
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

export async function createStudentInDb(params: {
  schoolId: string;
  name: string;
  class?: string;
  schoolYear?: string;
  coach?: string;
}): Promise<StudentWithData> {
  const supabase = createClient();

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

export async function updateStudentInDb(
  studentId: string,
  updates: Partial<Pick<Student, "name" | "class" | "school_year" | "coach" | "process_step">>
): Promise<Student> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("students")
    .update(updates)
    .eq("id", studentId)
    .select()
    .single();

  if (error) throw error;
  return data as Student;
}

export async function deleteStudentFromDb(studentId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("students").delete().eq("id", studentId);
  if (error) throw error;
}

export async function saveFicheInDb(
  studentId: string,
  fase: number,
  data: Record<string, unknown>
): Promise<Fiche> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("fiches")
    .select("id")
    .eq("student_id", studentId)
    .eq("fase", fase)
    .maybeSingle();

  if (existing) {
    const { data: updated, error } = await supabase
      .from("fiches")
      .update({ data, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return updated as Fiche;
  }

  const { data: created, error } = await supabase
    .from("fiches")
    .insert({ student_id: studentId, fase, data })
    .select()
    .single();

  if (error) throw error;
  return created as Fiche;
}

export async function updateCompetencyInDb(
  studentId: string,
  competencyKey: string,
  score: CompetencyScore
): Promise<Competency> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("competencies")
    .select("id")
    .eq("student_id", studentId)
    .eq("competency_key", competencyKey)
    .maybeSingle();

  if (existing) {
    const { data: updated, error } = await supabase
      .from("competencies")
      .update({ score })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return updated as Competency;
  }

  const { data: created, error } = await supabase
    .from("competencies")
    .insert({ student_id: studentId, competency_key: competencyKey, score })
    .select()
    .single();

  if (error) throw error;
  return created as Competency;
}

export async function addLogInDb(params: {
  studentId: string;
  date: string;
  title: string;
  content: string;
  competenciesUsed: string[];
}): Promise<Log> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("logs")
    .insert({
      student_id: params.studentId,
      date: params.date,
      title: params.title,
      content: params.content,
      competencies_used: params.competenciesUsed,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Log;
}

export async function deleteLogFromDb(logId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("logs").delete().eq("id", logId);
  if (error) throw error;
}

export function formatDateToDisplay(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
}

export function formatDateToISO(displayDate: string): string {
  const parts = displayDate.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return displayDate;
}
