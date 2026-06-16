/** Demo leerling-data seed — gebruikt door seed-demo-teachers.mjs */

const ALL_KEYS = [
  "vt1", "vt2", "vt3", "vt4", "vt5",
  "lb1", "lb2", "lb3", "lb4", "lb5",
  "am1", "am2", "am3", "am4", "am5",
];

const DEFAULT_SCORE = { m1: "nvt", m2: "nvt", m3: "nvt", note: "" };

const SENNE_SCORES = {
  vt1: { m1: "soms", m2: "meestal", m3: "altijd", note: "Sterk technisch inzicht bij bekabeling." },
  vt3: { m1: "soms", m2: "meestal", m3: "meestal", note: "PBM's consequent correct gebruikt." },
  am2: { m1: "zelden", m2: "soms", m3: "meestal", note: "Stiptheid verbetert merkbaar." },
  am5: { m1: "meestal", m2: "altijd", m3: "altijd", note: "Zeer gemotiveerd op de werf." },
};

const LISA_SCORES = {
  lb2: { m1: "meestal", m2: "meestal", m3: "altijd", note: "Duidelijke motivatie voor duaal traject." },
  lb3: { m1: "soms", m2: "meestal", m3: "meestal", note: "Actief op zoek naar stage-informatie." },
  am1: { m1: "soms", m2: "meestal", m3: "meestal", note: "Professionele communicatie naar leerkracht." },
  vt2: { m1: "zelden", m2: "soms", m3: "meestal", note: "Planning wordt stilaan zelfstandiger." },
};

async function seedStudent(supabase, schoolId, config) {
  const { data: student, error } = await supabase
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
  if (error) throw error;

  await supabase.from("fiches").insert([
    { student_id: student.id, fase: 1, data: config.screening },
    { student_id: student.id, fase: 2, data: { ...config.analyse, iopFocus: config.iopFocus } },
    { student_id: student.id, fase: 5, data: { klassenraad: "", advies: "" } },
  ]);

  await supabase.from("competencies").insert(
    ALL_KEYS.map((key) => ({
      student_id: student.id,
      competency_key: key,
      score: config.scores[key] || DEFAULT_SCORE,
    }))
  );

  if (config.logs.length) {
    await supabase.from("logs").insert(
      config.logs.map((log) => ({ ...log, student_id: student.id }))
    );
  }

  return student;
}

export async function seedSchoolDemoData(supabase, schoolId, userId, coachName) {
  const { count } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId);

  if (count && count > 0) {
    console.log(`   📂 Leerlingdossiers bestaan al (${count}) — overgeslagen`);
    return;
  }

  const senne = await seedStudent(supabase, schoolId, {
    name: "Senne Devos",
    class: "5 Elektrotechnieken Duaal",
    schoolYear: "2026-2027",
    coach: coachName,
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
    scores: SENNE_SCORES,
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
  });

  await seedStudent(supabase, schoolId, {
    name: "Lisa Peeters",
    class: "5 Elektrotechnieken Duaal",
    schoolYear: "2026-2027",
    coach: coachName,
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
    scores: LISA_SCORES,
    logs: [
      {
        date: "02/11/2025",
        title: "Stageoriëntatie",
        content: "Lisa stelde gerichte vragen over de werkculturen bij installatiebedrijven.",
        competencies_used: ["lb3", "am1"],
      },
    ],
  });

  console.log(`   📚 Demo-leerlingen aangemaakt (Senne + Lisa)`);

  try {
    const today = new Date();
    const eventDate = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().slice(0, 10);

    const { data: prep } = await supabase
      .from("lesson_preparations")
      .insert({
        school_id: schoolId,
        created_by: userId,
        title: "Veiligheid op de werkplek",
        notes: "Introductie veiligheidsprocedures, PBM's en EHBO-basis.",
        competencies: ["vt3", "am2", "lb3"],
        student_ids: [senne.id],
      })
      .select()
      .single();

    if (prep) {
      await supabase.from("planner_events").insert([
        {
          school_id: schoolId,
          event_date: eventDate,
          assignment_title: "Installatietechniek — Veiligheid & bekabeling",
          assignment_notes: "Werkplekactiviteit gekoppeld aan lesvoorbereiding.",
          lesson_preparation_id: prep.id,
          student_ids: [senne.id],
        },
        {
          school_id: schoolId,
          event_date: yesterdayDate,
          assignment_title: "Loopbaanoriëntatie & stageverkenning",
          assignment_notes: "Stage-onderzoek en reflectie.",
          lesson_preparation_id: null,
          student_ids: [senne.id],
        },
      ]);
      console.log(`   📅 Planner demo-gebeurtenissen aangemaakt`);
    }
  } catch {
    console.log(`   ⚠️  Planner-tabellen niet gevonden — run migratie 002`);
  }
}
