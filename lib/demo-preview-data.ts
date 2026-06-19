import { ALL_COMPETENCY_KEYS, DEFAULT_COMPETENCY_SCORE } from "@/lib/constants";
import { assembleStudentData } from "@/lib/db";
import type {
  AuthSession,
  CompetencyScore,
  LessonPreparation,
  PlannerEvent,
  StudentWithData,
} from "@/types";

const SCHOOL_ID = "preview-school-clw";
const USER_ID = "preview-user";
const NOW = "2026-06-16T10:00:00.000Z";

interface DemoStudentConfig {
  id: string;
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
    id: string;
    date: string;
    title: string;
    content: string;
    competencies_used: string[];
  }>;
}

const SENNE: DemoStudentConfig = {
  id: "preview-student-senne",
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
      id: "preview-log-senne-1",
      date: "15/09/2025",
      title: "Introductie les",
      content: "Vlot gesprek over de afspraken en de veiligheid op de werkplek.",
      competencies_used: ["vt3"],
    },
    {
      id: "preview-log-senne-2",
      date: "24/10/2025",
      title: "Project bekabeling",
      content: "Heeft zelfstandig en ordelijk een verdeelbord aangesloten.",
      competencies_used: ["vt1", "am5"],
    },
  ],
};

const LISA: DemoStudentConfig = {
  id: "preview-student-lisa",
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
      id: "preview-log-lisa-1",
      date: "02/11/2025",
      title: "Stageoriëntatie",
      content: "Lisa stelde gerichte vragen over de werkculturen bij installatiebedrijven.",
      competencies_used: ["lb3", "am1"],
    },
  ],
};

function buildStudent(config: DemoStudentConfig): StudentWithData {
  const student = {
    id: config.id,
    school_id: SCHOOL_ID,
    name: config.name,
    class: config.class,
    school_year: config.schoolYear,
    coach: config.coach,
    process_step: config.processStep,
    created_at: NOW,
  };

  const fiches = [
    {
      id: `${config.id}-fiche-1`,
      student_id: config.id,
      fase: 1,
      data: config.screening,
      updated_at: NOW,
    },
    {
      id: `${config.id}-fiche-2`,
      student_id: config.id,
      fase: 2,
      data: { ...config.analyse, iopFocus: config.iopFocus },
      updated_at: NOW,
    },
    {
      id: `${config.id}-fiche-5`,
      student_id: config.id,
      fase: 5,
      data: { klassenraad: "", advies: "" },
      updated_at: NOW,
    },
  ];

  const competencies = ALL_COMPETENCY_KEYS.map((key) => ({
    id: `${config.id}-comp-${key}`,
    student_id: config.id,
    competency_key: key,
    score: config.scores[key] || DEFAULT_COMPETENCY_SCORE,
  }));

  const logs = config.logs.map((log) => ({
    ...log,
    student_id: config.id,
  }));

  return assembleStudentData(student, fiches, competencies, logs);
}

export function getPreviewSession(): AuthSession {
  return {
    user: {
      id: USER_ID,
      email: "els.vermeulen@athena-clw.be",
      school_id: SCHOOL_ID,
      role: "teacher",
      created_at: NOW,
    },
    school: {
      id: SCHOOL_ID,
      name: "Athena CLW",
      plan: "pro",
      email_domain: "athena-clw.be",
      stripe_customer_id: null,
      subscription_status: "active",
      created_at: NOW,
    },
  };
}

export function getPreviewStudents(): StudentWithData[] {
  return [buildStudent(SENNE), buildStudent(LISA)];
}

export function getPreviewPlannerData(): {
  lessonPreparations: LessonPreparation[];
  plannerEvents: PlannerEvent[];
} {
  const today = new Date();
  const eventDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  const prep1: LessonPreparation = {
    id: "preview-prep-1",
    school_id: SCHOOL_ID,
    created_by: USER_ID,
    title: "Veiligheid op de werkplek",
    notes:
      "Introductie veiligheidsprocedures, PBM's en EHBO-basis. Praktische oefening met verdeelbord.",
    competencies: ["vt3", "am2", "lb3"],
    student_ids: [SENNE.id, LISA.id],
    drive_links: [
      {
        label: "EHBO & veiligheid — cursusmap",
        url: "https://drive.google.com/file/d/1demo-ehbo-veiligheid/view",
      },
      {
        label: "Werkblad PBM's",
        url: "https://docs.google.com/document/d/1demo-werkblad-pbm/view",
      },
    ],
    created_at: NOW,
    updated_at: NOW,
  };

  const prep2: LessonPreparation = {
    id: "preview-prep-2",
    school_id: SCHOOL_ID,
    created_by: USER_ID,
    title: "Stageoriëntatie & arbeidsmarktverkenning",
    notes:
      "Leerlingen verkennen installatiebedrijven, stellen interviewvragen en reflecteren op loopbaandoelen.",
    competencies: ["lb2", "lb3", "am1"],
    student_ids: [LISA.id],
    drive_links: [
      {
        label: "Stagegids installatiesector",
        url: "https://drive.google.com/file/d/1demo-stagegids/view",
      },
    ],
    created_at: NOW,
    updated_at: NOW,
  };

  const events: PlannerEvent[] = [
    {
      id: "preview-event-1",
      school_id: SCHOOL_ID,
      event_date: eventDate,
      assignment_title: "Installatietechniek — Veiligheid & bekabeling",
      assignment_notes: "Werkplekactiviteit gekoppeld aan lesvoorbereiding.",
      lesson_preparation_id: prep1.id,
      student_ids: [SENNE.id, LISA.id],
      created_at: NOW,
      updated_at: NOW,
    },
    {
      id: "preview-event-2",
      school_id: SCHOOL_ID,
      event_date: yesterdayDate,
      assignment_title: "Loopbaanoriëntatie & stageverkenning",
      assignment_notes: "Lisa presenteerde haar stage-onderzoek aan de klas.",
      lesson_preparation_id: null,
      student_ids: [LISA.id],
      created_at: NOW,
      updated_at: NOW,
    },
  ];

  return { lessonPreparations: [prep1, prep2], plannerEvents: events };
}
