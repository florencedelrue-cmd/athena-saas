import type { SupabaseClient } from "@supabase/supabase-js";
import { ALL_COMPETENCY_KEYS, DEFAULT_COMPETENCY_SCORE } from "@/lib/constants";
import type { CompetencyScore, StudentWithData } from "@/types";
import { assembleStudentData } from "@/lib/db";

interface DemoStudentConfig {
  name: string;
  class: string;
  schoolYear: string;
  coach: string;
  processStep: number;
  iopFocus: string[];
  screening: { feedUp: string; feedback: string; feedForward: string };
  analyse: { klassenraad: string; gesprek: string };
  scores: Record<string, CompetencyScore>;
  logs: Array<{
    date: string;
    title: string;
    content: string;
    competencies_used: string[];
  }>;
}

const SENNE: DemoStudentConfig = {
  name: "Senne Devos",
  class: "5 Elektrotechnieken Duaal",
  schoolYear: "2026-2027",
  coach: "Els Vermeulen",
  processStep: 1,
  iopFocus: ["vt1", "vt3", "am2", "am5"],
  screening: {
    feedUp: "Wil graag praktijkervaring opdoen op de werf.",
    feedback: "Toont uitstekend initiatief in de klas.",
    feedForward: "Afspraken rond EHBO en stiptheid strikt nakomen.",
  },
  analyse: {
    klassenraad: "Sterke screeningsklassenraad. Zeer gemotiveerde indruk.",
    gesprek: "Gesprek toont grote bereidheid om te leren.",
  },
  scores: {
    vt1: { m1: "soms", m2: "meestal", m3: "altijd", note: "Sterk technisch inzicht bij bekabeling." },
    vt3: { m1: "soms", m2: "meestal", m3: "meestal", note: "PBM's consequent correct gebruikt." },
    am2: { m1: "zelden", m2: "soms", m3: "meestal", note: "Stiptheid verbetert merkbaar." },
    am5: { m1: "meestal", m2: "altijd", m3: "altijd", note: "Zeer gemotiveerd op de werf." },
  },
  logs: [
    {
      date: "15/09/2025",
      title: "Introductie les",
      content: "Vlot gesprek over de afspraken en de veiligheid op de werkplek.",
      competencies_used: ["vt3"],
    },
    {
      date: "24/10/2025",
      title: "Project bekabeling",
      content: "Heeft zelfstandig en ordelijk een verdeelbord aangesloten.",
      competencies_used: ["vt1", "am5"],
    },
  ],
};

const LISA: DemoStudentConfig = {
  name: "Lisa Peeters",
  class: "5 Elektrotechnieken Duaal",
  schoolYear: "2026-2027",
  coach: "Els Vermeulen",
  processStep: 3,
  iopFocus: ["lb2", "lb3", "am1", "vt2"],
  screening: {
    feedUp: "Ambitie om te groeien in de installatiesector.",
    feedback: "Communicatief sterk, nog wat onzeker in technische uitvoering.",
    feedForward: "Extra begeleiding bij eerste werkplekmomenten inplannen.",
  },
  analyse: {
    klassenraad: "Positieve grondhouding, vraagt om meer structuur op de werf.",
    gesprek: "Lisa wil graag meer verantwoordelijkheid nemen in teamverband.",
  },
  scores: {
    lb2: { m1: "meestal", m2: "meestal", m3: "altijd", note: "Duidelijke motivatie voor duaal traject." },
    lb3: { m1: "soms", m2: "meestal", m3: "meestal", note: "Actief op zoek naar stage-informatie." },
    am1: { m1: "soms", m2: "meestal", m3: "meestal", note: "Professionele communicatie naar leerkracht." },
    vt2: { m1: "zelden", m2: "soms", m3: "meestal", note: "Planning wordt stilaan zelfstandiger." },
  },
  logs: [
    {
      date: "02/11/2025",
      title: "Stageoriëntatie",
      content: "Lisa stelde gerichte vragen over de werkculturen bij installatiebedrijven.",
      competencies_used: ["lb3", "am1"],
    },
  ],
};

async function seedOneStudent(
  supabase: SupabaseClient,
  schoolId: string,
  config: DemoStudentConfig
): Promise<StudentWithData> {
  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({
      school_id: schoolId,
      name: config.name,
      class: config.class,
      school_year: config.schoolYear,
      coach: config.coach,
      process_step: config.processStep,
    })
    .select()
    .single();

  if (studentError) throw studentError;

  const fiches = [
    { student_id: student.id, fase: 1, data: config.screening },
    {
      student_id: student.id,
      fase: 2,
      data: { ...config.analyse, iopFocus: config.iopFocus },
    },
    { student_id: student.id, fase: 5, data: { klassenraad: "", advies: "" } },
  ];

  const { data: insertedFiches, error: ficheError } = await supabase
    .from("fiches")
    .insert(fiches)
    .select();
  if (ficheError) throw ficheError;

  const competencyRows = ALL_COMPETENCY_KEYS.map((key) => ({
    student_id: student.id,
    competency_key: key,
    score: config.scores[key] || DEFAULT_COMPETENCY_SCORE,
  }));

  const { data: competencies, error: compError } = await supabase
    .from("competencies")
    .insert(competencyRows)
    .select();
  if (compError) throw compError;

  const logs = config.logs.map((log) => ({ ...log, student_id: student.id }));
  const { data: insertedLogs, error: logError } = await supabase
    .from("logs")
    .insert(logs)
    .select();
  if (logError) throw logError;

  return assembleStudentData(
    student,
    insertedFiches || [],
    competencies || [],
    insertedLogs || []
  );
}

export async function seedDemoData(
  supabase: SupabaseClient,
  schoolId: string,
  userId: string
): Promise<StudentWithData[] | null> {
  const { data: existing } = await supabase
    .from("students")
    .select("id")
    .eq("school_id", schoolId)
    .limit(1);

  if (existing && existing.length > 0) return null;

  const senne = await seedOneStudent(supabase, schoolId, SENNE);
  const lisa = await seedOneStudent(supabase, schoolId, LISA);

  await seedDemoPlanner(supabase, schoolId, userId, [senne.id, lisa.id]);

  return [senne, lisa];
}

async function seedDemoPlanner(
  supabase: SupabaseClient,
  schoolId: string,
  userId: string,
  studentIds: string[]
) {
  try {
    const today = new Date();
    const eventDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    const { data: prep, error: prepError } = await supabase
      .from("lesson_preparations")
      .insert({
        school_id: schoolId,
        created_by: userId,
        title: "Veiligheid op de werkplek",
        notes:
          "Introductie veiligheidsprocedures, PBM's en EHBO-basis. Praktische oefening met verdeelbord.",
        competencies: ["vt3", "am2", "lb3"],
        student_ids: studentIds,
        drive_links: [
          {
            label: "EHBO & veiligheid — cursusmap",
            url: "https://drive.google.com/file/d/1demo-ehbo-veiligheid/view",
          },
        ],
      })
      .select()
      .single();

    if (prepError) return;

    await supabase.from("planner_events").insert([
      {
        school_id: schoolId,
        event_date: eventDate,
        assignment_title: "Installatietechniek — Veiligheid & bekabeling",
        assignment_notes: "Werkplekactiviteit gekoppeld aan lesvoorbereiding.",
        lesson_preparation_id: prep.id,
        student_ids: studentIds,
      },
      {
        school_id: schoolId,
        event_date: yesterdayDate,
        assignment_title: "Loopbaanoriëntatie & stageverkenning",
        assignment_notes: "Lisa presenteerde haar stage-onderzoek aan de klas.",
        lesson_preparation_id: null,
        student_ids: [studentIds[1]],
      },
    ]);

    await supabase.from("lesson_preparations").insert({
      school_id: schoolId,
      created_by: userId,
      title: "Stageoriëntatie & arbeidsmarktverkenning",
      notes:
        "Leerlingen verkennen installatiebedrijven, stellen interviewvragen en reflecteren op loopbaandoelen.",
      competencies: ["lb2", "lb3", "am1"],
      student_ids: [studentIds[1]],
      drive_links: [
        {
          label: "Stagegids installatiesector",
          url: "https://drive.google.com/file/d/1demo-stagegids/view",
        },
      ],
    });
  } catch {
    // Planner-tabellen mogelijk nog niet gemigreerd
  }
}
