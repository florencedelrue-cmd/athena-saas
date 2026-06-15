export type UserRole = "admin" | "teacher";
export type SchoolPlan = "free" | "pro";
export type SubscriptionStatus = "active" | "inactive" | "trialing" | "past_due" | "canceled";

export interface School {
  id: string;
  name: string;
  plan: SchoolPlan;
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus;
  created_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  school_id: string;
  role: UserRole;
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  name: string;
  class: string;
  school_year: string;
  coach: string;
  process_step: number;
  created_at: string;
}

export interface Fiche {
  id: string;
  student_id: string;
  fase: number;
  data: FicheData;
  updated_at: string;
}

export interface ScreeningNotes {
  feedUp: string;
  feedback: string;
  feedForward: string;
}

export interface AnalyseNotes {
  klassenraad: string;
  gesprek: string;
  iopFocus: string[];
}

export interface DoorstroomNotes {
  klassenraad: string;
  advies: string;
}

export type FicheData = ScreeningNotes | AnalyseNotes | DoorstroomNotes | Record<string, never>;

export type ScoreValue = "zelden" | "soms" | "meestal" | "altijd" | "nvt";

export interface CompetencyScore {
  m1: ScoreValue;
  m2: ScoreValue;
  m3: ScoreValue;
  note: string;
}

export interface Competency {
  id: string;
  student_id: string;
  competency_key: string;
  score: CompetencyScore;
}

export interface Log {
  id: string;
  student_id: string;
  date: string;
  title: string;
  content: string;
  competencies_used: string[];
}

export interface StudentWithData extends Student {
  fiches: Fiche[];
  competencies: Competency[];
  logs: Log[];
}

export interface AuthSession {
  user: AppUser;
  school: School;
}

export type MainTab = "gesprek" | "volgsysteem";

export interface CompetencyItem {
  id: string;
  title: string;
  bullets: string[];
}

export interface CompetencyDomain {
  title: string;
  color: string;
  items: CompetencyItem[];
}

export type CompetencyDomainKey = "vt" | "lb" | "am";

export interface ProcessStepInfo {
  name: string;
  focus: string;
  focusText: string;
}

export interface ScoringScaleItem {
  key: ScoreValue;
  icon: string;
  label: string;
  color: string;
}

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: School;
        Insert: Omit<School, "created_at"> & { created_at?: string };
        Update: Partial<Omit<School, "id">>;
      };
      users: {
        Row: AppUser;
        Insert: Omit<AppUser, "created_at"> & { created_at?: string };
        Update: Partial<Omit<AppUser, "id">>;
      };
      students: {
        Row: Student;
        Insert: Omit<Student, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<Student, "id">>;
      };
      fiches: {
        Row: Fiche;
        Insert: Omit<Fiche, "id" | "updated_at"> & { id?: string; updated_at?: string };
        Update: Partial<Omit<Fiche, "id">>;
      };
      competencies: {
        Row: Competency;
        Insert: Omit<Competency, "id"> & { id?: string };
        Update: Partial<Omit<Competency, "id">>;
      };
      logs: {
        Row: Log;
        Insert: Omit<Log, "id"> & { id?: string };
        Update: Partial<Omit<Log, "id">>;
      };
    };
  };
}
