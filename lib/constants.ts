import type {
  CompetencyDomain,
  CompetencyDomainKey,
  ProcessStepInfo,
  ScoringScaleItem,
} from "@/types";

export const PROCESS_STEPS: Record<number, ProcessStepInfo> = {
  1: { name: "1. Screening", focus: "lb", focusText: "Focus op Loopbaangericht (LB)" },
  2: { name: "2. Analyse screeningsklassenraad", focus: "lb", focusText: "Focus op Loopbaangericht (LB)" },
  3: { name: "3. Competentiemeter", focus: "vt", focusText: "Focus op Vaktechnisch (VT)" },
  4: { name: "4. Uitvoering", focus: "am", focusText: "Focus op Arbeidsmarktgericht (AM)" },
  5: { name: "5. Doorstroom", focus: "all", focusText: "Integrale Evaluatie (Alle domeinen)" },
};

export const SCORING_SCALE: ScoringScaleItem[] = [
  { key: "zelden", icon: "Z", label: "Zelden", color: "bg-red-500 border-red-600 text-white" },
  { key: "soms", icon: "S", label: "Soms", color: "bg-orange-500 border-orange-600 text-white" },
  { key: "meestal", icon: "M", label: "Meestal", color: "bg-yellow-500 border-yellow-600 text-slate-900" },
  { key: "altijd", icon: "A", label: "Altijd", color: "bg-emerald-500 border-emerald-600 text-white" },
  { key: "nvt", icon: "⚪", label: "N.v.t.", color: "bg-slate-300 border-slate-400 text-slate-700" },
];

export const COMPETENCIES_DATA: Record<CompetencyDomainKey, CompetencyDomain> = {
  vt: {
    title: "Vaktechnisch",
    color: "rose",
    items: [
      {
        id: "vt1",
        title: "vt1: Past vaktechnische kennis en vaardigheden toe binnen een specifieke beroepsopdracht.",
        bullets: ["Voert opdrachten correct uit volgens instructies.", "Gebruikt de juiste materialen.", "Werkt kwaliteitsvol."],
      },
      {
        id: "vt2",
        title: "vt2: Toont organisatorische en technische vaardigheden door projecten te plannen, uit te voeren en te evalueren.",
        bullets: ["Maakt een duidelijke planning.", "Evalueert het resultaat."],
      },
      {
        id: "vt3",
        title: "vt3: Verkent en past basisveiligheidsprocedures en PBM's correct toe.",
        bullets: ["Gebruikt PBM's volgens de richtlijnen.", "Handelt veilig."],
      },
      {
        id: "vt4",
        title: "vt4: Verkent basis EHBO-technieken.",
        bullets: ["Kan hulpdiensten correct contacteren.", "Past basis EHBO toe."],
      },
      {
        id: "vt5",
        title: "vt5: Maakt observaties over technische processen.",
        bullets: ["Stelt vragen tijdens rondleiding.", "Verwoordt wat hij/zij geleerd heeft."],
      },
    ],
  },
  lb: {
    title: "Loopbaangericht",
    color: "blue",
    items: [
      {
        id: "lb1",
        title: "lb1: Reflecteert over zichzelf: interesses, sterktes, talenten and ontwikkelpunten.",
        bullets: ["Benoemt eigen sterktes en doelen.", "Denkt na over groeipotentieel."],
      },
      {
        id: "lb2",
        title: "lb2: Maakt een bewuste keuze voor de duale leerweg en kan deze motiveren.",
        bullets: ["Legt uit wat duaal leren inhoudt.", "Motiveert waarom dit bij hem/haar past."],
      },
      {
        id: "lb3",
        title: "lb3: Verkent actief de arbeidsmarkt, beroepen en leertrajecten.",
        bullets: ["Zoekt info over beroepen/sectoren.", "Stelt gerichte vragen."],
      },
      {
        id: "lb4",
        title: "lb4: Neemt initiatief om loopbaankansen te verkennen.",
        bullets: ["Zoekt actief naar kansen.", "Gebruikt eigen netwerk."],
      },
      {
        id: "lb5",
        title: "lb5: Kan eigen ervaringen en kwaliteiten zichtbaar maken.",
        bullets: ["Beschrijft leerervaringen.", "Formuleert doelen voor ontwikkeling."],
      },
    ],
  },
  am: {
    title: "Arbeidsmarktgericht",
    color: "emerald",
    items: [
      {
        id: "am1",
        title: "am1: Communiceert op een gepaste en professionele manier.",
        bullets: ["Spreekt beleefd en duidelijk.", "Pas taalgebruik aan de context aan."],
      },
      {
        id: "am2",
        title: "am2: Toont betrouwbaarheid.",
        bullets: ["Komt op tijd.", "Houdt zich aan gemaakte afspraken.", "Verwittigt correct bij afwezigheid."],
      },
      {
        id: "am3",
        title: "am3: Werkt goed samen.",
        bullets: ["Helpt teamleden.", "Respecteert groepsafspraken."],
      },
      {
        id: "am4",
        title: "am4: Werken onder begeleiding en neemt instructies op.",
        bullets: ["Luistert naar instructies.", "Vraagt tijdig om hulp."],
      },
      {
        id: "am5",
        title: "am5: Toont inzet en motivatie.",
        bullets: ["Neemt initiatief.", "Doet verbetersuggesties."],
      },
    ],
  },
};

export const ALL_COMPETENCY_KEYS: string[] = Object.values(COMPETENCIES_DATA).flatMap(
  (domain) => domain.items.map((item) => item.id)
);

export const DEFAULT_COMPETENCY_SCORE = {
  m1: "nvt" as const,
  m2: "nvt" as const,
  m3: "nvt" as const,
  note: "",
};

export const SCORE_MAP: Record<string, number> = {
  zelden: 1,
  soms: 2,
  meestal: 3,
  altijd: 4,
  nvt: 0,
};

export const SCORE_COLORS: Record<string, string> = {
  zelden: "bg-red-500 text-white",
  soms: "bg-orange-500 text-white",
  meestal: "bg-yellow-500 text-slate-800",
  altijd: "bg-emerald-500 text-white",
  nvt: "bg-slate-200 text-slate-500",
};
