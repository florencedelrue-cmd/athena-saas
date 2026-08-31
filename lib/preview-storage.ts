import type { LessonPreparation, PlannerEvent, StudentWithData } from "@/types";
import { normalizeCompetencyScore } from "@/lib/competency-score";

const STORAGE_KEY = "athena-preview-data-v1";

export interface PreviewPersistedData {
  students: StudentWithData[];
  lessonPreparations: LessonPreparation[];
  plannerEvents: PlannerEvent[];
  savedAt: string;
}

function normalizeStudents(students: StudentWithData[]): StudentWithData[] {
  return students.map((student) => ({
    ...student,
    competencies: student.competencies.map((comp) => ({
      ...comp,
      score: normalizeCompetencyScore(comp.score),
    })),
  }));
}

export function loadPreviewData(schoolId: string): PreviewPersistedData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${schoolId}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PreviewPersistedData;
    if (!parsed?.students?.length) return null;

    return {
      ...parsed,
      students: normalizeStudents(parsed.students),
      lessonPreparations: (parsed.lessonPreparations || []).map((prep) => ({
        ...prep,
        drive_links: prep.drive_links ?? [],
      })),
      plannerEvents: parsed.plannerEvents || [],
    };
  } catch {
    return null;
  }
}

export function savePreviewData(
  schoolId: string,
  data: Pick<PreviewPersistedData, "students" | "lessonPreparations" | "plannerEvents">
): void {
  if (typeof window === "undefined") return;

  try {
    const payload: PreviewPersistedData = {
      ...data,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(`${STORAGE_KEY}:${schoolId}`, JSON.stringify(payload));
  } catch {
    // localStorage vol of niet beschikbaar
  }
}

export function clearPreviewData(schoolId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(`${STORAGE_KEY}:${schoolId}`);
}
