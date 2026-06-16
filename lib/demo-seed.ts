import type { SupabaseClient } from "@supabase/supabase-js";
import { ALL_COMPETENCY_KEYS, DEFAULT_COMPETENCY_SCORE } from "@/lib/constants";
import type { CompetencyScore, StudentWithData } from "@/types";
import { assembleStudentData } from "@/lib/db";

const DEMO_SCORES: Record<string, CompetencyScore> = {
  vt1: { m1: "soms", m2: "meestal", m3: "altijd", note: "Sterk technisch inzicht bij bekabeling." },
  vt3: { m1: "soms", m2: "meestal", m3: "meestal", note: "PBM's consequent correct gebruikt." },
  am2: { m1: "zelden", m2: "soms", m3: "meestal", note: "Stiptheid verbetert merkbaar." },
  am5: { m1: "meestal", m2: "altijd", m3: "altijd", note: "Zeer gemotiveerd op de werf." },
};

export async function seedDemoData(
  supabase: SupabaseClient,
  schoolId: string,
  userId: string
): Promise<StudentWithData | null> {
  const { data: existing } = await supabase
    .from("students")
    .select("id")
    .eq("school_id", schoolId)
    .limit(1);

  if (existing && existing.length > 0) return null;

  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({
      school_id: schoolId,
      name: "Senne Devos",
      class: "5 Elektrotechnieken Duaal",
      school_year: "2026-2027",
      coach: "Els Vermeulen",
      process_step: 1,
    })
    .select()
    .single();

  if (studentError) throw studentError;

  const iopFocus = ["vt1", "vt3", "am2", "am5"];

  const fiches = [
    {
      student_id: student.id,
      fase: 1,
      data: {
        feedUp: "Wil graag praktijkervaring opdoen op de werf.",
        feedback: "Toont uitstekend initiatief in de klas.",
        feedForward: "Afspraken rond EHBO en stiptheid strikt nakomen.",
      },
    },
    {
      student_id: student.id,
      fase: 2,
      data: {
        klassenraad: "Sterke screeningsklassenraad. Zeer gemotiveerde indruk.",
        gesprek: "Gesprek toont grote bereidheid om te leren.",
        iopFocus,
      },
    },
    {
      student_id: student.id,
      fase: 5,
      data: { klassenraad: "", advies: "" },
    },
  ];

  const { data: insertedFiches, error: ficheError } = await supabase
    .from("fiches")
    .insert(fiches)
    .select();
  if (ficheError) throw ficheError;

  const competencyRows = ALL_COMPETENCY_KEYS.map((key) => ({
    student_id: student.id,
    competency_key: key,
    score: DEMO_SCORES[key] || DEFAULT_COMPETENCY_SCORE,
  }));

  const { data: competencies, error: compError } = await supabase
    .from("competencies")
    .insert(competencyRows)
    .select();
  if (compError) throw compError;

  const logs = [
    {
      student_id: student.id,
      date: "15/09/2025",
      title: "Introductie les",
      content: "Vlot gesprek over de afspraken en de veiligheid op de werkplek.",
      competencies_used: ["vt3"],
    },
    {
      student_id: student.id,
      date: "24/10/2025",
      title: "Project bekabeling",
      content: "Heeft zelfstandig en ordelijk een verdeelbord aangesloten.",
      competencies_used: ["vt1", "am5"],
    },
  ];

  const { data: insertedLogs, error: logError } = await supabase
    .from("logs")
    .insert(logs)
    .select();
  if (logError) throw logError;

  await seedDemoPlanner(supabase, schoolId, userId, student.id);

  return assembleStudentData(
    student,
    insertedFiches || [],
    competencies || [],
    insertedLogs || []
  );
}

async function seedDemoPlanner(
  supabase: SupabaseClient,
  schoolId: string,
  userId: string,
  studentId: string
) {
  try {
    const today = new Date();
    const eventDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const { data: prep, error: prepError } = await supabase
      .from("lesson_preparations")
      .insert({
        school_id: schoolId,
        created_by: userId,
        title: "Veiligheid op de werkplek",
        notes:
          "Introductie veiligheidsprocedures, PBM's en EHBO-basis. Praktische oefening met verdeelbord.",
        competencies: ["vt3", "am2"],
        student_ids: [studentId],
      })
      .select()
      .single();

    if (prepError) return;

    await supabase.from("planner_events").insert({
      school_id: schoolId,
      event_date: eventDate,
      assignment_title: "Installatietechniek — Veiligheid & bekabeling",
      assignment_notes: "Werkplekactiviteit gekoppeld aan lesvoorbereiding.",
      lesson_preparation_id: prep.id,
      student_ids: [studentId],
    });
  } catch {
    // Planner-tabellen mogelijk nog niet gemigreerd
  }
}
