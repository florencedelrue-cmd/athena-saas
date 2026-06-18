"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ALL_COMPETENCY_KEYS, DEFAULT_COMPETENCY_SCORE } from "@/lib/constants";
import { createClient } from "@/lib/supabase";
import {
  addLogInDb,
  createStudentInDb,
  deleteLogFromDb,
  deleteStudentFromDb,
  fetchStudentsForSchool,
  formatDateToDisplay,
  getAnalyseNotes,
  getAssessments,
  getDoorstroomNotes,
  getScreeningNotes,
  saveFicheInDb,
  updateCompetencyInDb,
  updateStudentInDb,
} from "@/lib/db";
import {
  createLessonPreparationInDb,
  createPlannerEventInDb,
  deleteLessonPreparationFromDb,
  deletePlannerEventFromDb,
  fetchPlannerDataForSchool,
  updateLessonPreparationInDb,
  updatePlannerEventInDb,
} from "@/lib/db-planner";
import type {
  AnalyseNotes,
  AppUser,
  AuthSession,
  CompetencyScore,
  DoorstroomNotes,
  LessonPreparation,
  Log,
  Log,
  MainTab,
  PlannerEvent,
  School,
  ScreeningNotes,
  ScoreValue,
  StudentWithData,
} from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

type SaveStatus = "idle" | "saving" | "saved" | "error" | "detected";

interface AppContextValue {
  previewMode: boolean;
  session: AuthSession;
  students: StudentWithData[];
  activeStudent: StudentWithData | null;
  activeStudentId: string | null;
  loading: boolean;
  saveStatus: SaveStatus;
  mainTab: MainTab;
  onlyShowIopFocus: boolean;
  setMainTab: (tab: MainTab) => void;
  setOnlyShowIopFocus: (value: boolean) => void;
  switchStudent: (id: string) => void;
  fetchStudents: () => Promise<void>;
  createStudent: (name: string) => Promise<void>;
  updateStudent: (updates: Partial<Pick<StudentWithData, "name" | "class" | "school_year" | "coach" | "process_step">>) => Promise<void>;
  deleteStudent: () => Promise<void>;
  setProcessStep: (step: number) => Promise<void>;
  saveScreeningNotes: (notes: ScreeningNotes) => Promise<void>;
  saveAnalyseNotes: (notes: Omit<AnalyseNotes, "iopFocus">) => Promise<void>;
  toggleIopFocus: (competencyId: string) => Promise<void>;
  setCompScore: (competencyKey: string, milestone: "m1" | "m2" | "m3", value: ScoreValue) => Promise<void>;
  setCompNote: (competencyKey: string, note: string) => Promise<void>;
  saveDoorstroomNotes: (notes: DoorstroomNotes) => Promise<void>;
  addLog: (params: { date: string; title: string; content: string; competenciesUsed: string[] }) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
  forceSync: () => Promise<void>;
  getScreening: () => ScreeningNotes;
  getAnalyse: () => AnalyseNotes;
  getDoorstroom: () => DoorstroomNotes;
  getAssessmentsMap: () => Record<string, CompetencyScore>;
  lessonPreparations: LessonPreparation[];
  plannerEvents: PlannerEvent[];
  fetchPlannerData: () => Promise<void>;
  createLessonPreparation: (params: {
    title: string;
    notes?: string;
    competencies: string[];
    studentIds: string[];
  }) => Promise<LessonPreparation>;
  updateLessonPreparation: (
    id: string,
    params: {
      title: string;
      notes?: string;
      competencies: string[];
      studentIds: string[];
    }
  ) => Promise<void>;
  deleteLessonPreparation: (id: string) => Promise<void>;
  createPlannerEvent: (params: {
    eventDate: string;
    assignmentTitle: string;
    assignmentNotes?: string;
    lessonPreparationId?: string | null;
    studentIds: string[];
  }) => Promise<void>;
  updatePlannerEvent: (
    id: string,
    params: {
      eventDate: string;
      assignmentTitle: string;
      assignmentNotes?: string;
      lessonPreparationId?: string | null;
      studentIds: string[];
    }
  ) => Promise<void>;
  deletePlannerEvent: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

interface AppProviderProps {
  previewMode?: boolean;
  session: AuthSession;
  initialStudents: StudentWithData[];
  initialLessonPreparations?: LessonPreparation[];
  initialPlannerEvents?: PlannerEvent[];
  children: React.ReactNode;
}

export function AppProvider({
  previewMode = false,
  session,
  initialStudents,
  initialLessonPreparations = [],
  initialPlannerEvents = [],
  children,
}: AppProviderProps) {
  const [students, setStudents] = useState<StudentWithData[]>(initialStudents);
  const [lessonPreparations, setLessonPreparations] = useState<LessonPreparation[]>(
    initialLessonPreparations
  );
  const [plannerEvents, setPlannerEvents] = useState<PlannerEvent[]>(initialPlannerEvents);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(
    initialStudents[0]?.id ?? null
  );
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [mainTab, setMainTab] = useState<MainTab>("gesprek");
  const [onlyShowIopFocus, setOnlyShowIopFocus] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const realtimeChannels = useRef<RealtimeChannel[]>([]);

  const activeStudent = students.find((s) => s.id === activeStudentId) ?? null;

  const triggerAutoSave = useCallback(() => {
    setSaveStatus("detected");
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setSaveStatus("saved");
    }, 1000);
  }, []);

  const updateLocalStudent = useCallback(
    (studentId: string, updater: (student: StudentWithData) => StudentWithData) => {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? updater(s) : s))
      );
    },
    []
  );

  const fetchStudents = useCallback(async () => {
    if (previewMode) {
      setSaveStatus("saved");
      return;
    }
    setLoading(true);
    try {
      const data = await fetchStudentsForSchool(session.school.id);
      setStudents(data);
      if (!activeStudentId && data.length > 0) {
        setActiveStudentId(data[0].id);
      } else if (activeStudentId && !data.find((s) => s.id === activeStudentId)) {
        setActiveStudentId(data[0]?.id ?? null);
      }
      setSaveStatus("saved");
    } catch (err) {
      console.error("fetchStudents error:", err);
      setSaveStatus("error");
    } finally {
      setLoading(false);
    }
  }, [previewMode, session.school.id, activeStudentId]);

  const fetchPlannerData = useCallback(async () => {
    if (previewMode) return;
    try {
      const data = await fetchPlannerDataForSchool(session.school.id);
      setLessonPreparations(data.lessonPreparations);
      setPlannerEvents(data.plannerEvents);
    } catch (err) {
      console.error("fetchPlannerData error:", err);
    }
  }, [previewMode, session.school.id]);

  const forceSync = useCallback(async () => {
    if (previewMode) {
      setSaveStatus("saved");
      return;
    }
    setSaveStatus("saving");
    try {
      await Promise.all([fetchStudents(), fetchPlannerData()]);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, [previewMode, fetchStudents, fetchPlannerData]);

  const switchStudent = useCallback((id: string) => {
    setActiveStudentId(id);
  }, []);

  const createStudent = useCallback(
    async (name: string) => {
      setSaveStatus("saving");
      if (previewMode) {
        const id = `preview-student-${Date.now()}`;
        const newStudent: StudentWithData = {
          id,
          school_id: session.school.id,
          name,
          class: "",
          school_year: "2026-2027",
          coach: "",
          process_step: 1,
          created_at: new Date().toISOString(),
          fiches: [],
          competencies: ALL_COMPETENCY_KEYS.map((key) => ({
            id: `${id}-comp-${key}`,
            student_id: id,
            competency_key: key,
            score: { ...DEFAULT_COMPETENCY_SCORE },
          })),
          logs: [],
        };
        setStudents((prev) => [...prev, newStudent]);
        setActiveStudentId(newStudent.id);
        setSaveStatus("saved");
        return;
      }
      try {
        const newStudent = await createStudentInDb({
          schoolId: session.school.id,
          name,
        });
        setStudents((prev) => [...prev, newStudent]);
        setActiveStudentId(newStudent.id);
        setSaveStatus("saved");
      } catch (err) {
        console.error("createStudent error:", err);
        setSaveStatus("error");
        throw err;
      }
    },
    [previewMode, session.school.id]
  );

  const updateStudent = useCallback(
    async (updates: Partial<Pick<StudentWithData, "name" | "class" | "school_year" | "coach" | "process_step">>) => {
      if (!activeStudentId) return;
      setSaveStatus("saving");
      if (previewMode) {
        updateLocalStudent(activeStudentId, (s) => ({ ...s, ...updates }));
        setSaveStatus("saved");
        triggerAutoSave();
        return;
      }
      try {
        const updated = await updateStudentInDb(activeStudentId, updates);
        updateLocalStudent(activeStudentId, (s) => ({ ...s, ...updated }));
        setSaveStatus("saved");
        triggerAutoSave();
      } catch (err) {
        console.error("updateStudent error:", err);
        setSaveStatus("error");
      }
    },
    [activeStudentId, previewMode, updateLocalStudent, triggerAutoSave]
  );

  const deleteStudent = useCallback(async () => {
    if (!activeStudentId || students.length <= 1) return;
    setSaveStatus("saving");
    if (previewMode) {
      const remaining = students.filter((s) => s.id !== activeStudentId);
      setStudents(remaining);
      setActiveStudentId(remaining[0]?.id ?? null);
      setSaveStatus("saved");
      return;
    }
    try {
      await deleteStudentFromDb(activeStudentId);
      const remaining = students.filter((s) => s.id !== activeStudentId);
      setStudents(remaining);
      setActiveStudentId(remaining[0]?.id ?? null);
      setSaveStatus("saved");
    } catch (err) {
      console.error("deleteStudent error:", err);
      setSaveStatus("error");
    }
  }, [activeStudentId, previewMode, students]);

  const setProcessStep = useCallback(
    async (step: number) => {
      await updateStudent({ process_step: step });
    },
    [updateStudent]
  );

  const saveScreeningNotes = useCallback(
    async (notes: ScreeningNotes) => {
      if (!activeStudentId) return;
      setSaveStatus("saving");
      if (previewMode) {
        updateLocalStudent(activeStudentId, (s) => {
          const fiche = {
            id: `${activeStudentId}-fiche-1`,
            student_id: activeStudentId,
            fase: 1,
            data: notes,
            updated_at: new Date().toISOString(),
          };
          return {
            ...s,
            fiches: s.fiches.some((f) => f.fase === 1)
              ? s.fiches.map((f) => (f.fase === 1 ? fiche : f))
              : [...s.fiches, fiche],
          };
        });
        setSaveStatus("saved");
        triggerAutoSave();
        return;
      }
      try {
        const fiche = await saveFicheInDb(activeStudentId, 1, notes);
        updateLocalStudent(activeStudentId, (s) => ({
          ...s,
          fiches: s.fiches.some((f) => f.fase === 1)
            ? s.fiches.map((f) => (f.fase === 1 ? fiche : f))
            : [...s.fiches, fiche],
        }));
        setSaveStatus("saved");
        triggerAutoSave();
      } catch (err) {
        console.error("saveScreeningNotes error:", err);
        setSaveStatus("error");
      }
    },
    [activeStudentId, previewMode, updateLocalStudent, triggerAutoSave]
  );

  const saveAnalyseNotes = useCallback(
    async (notes: Omit<AnalyseNotes, "iopFocus">) => {
      if (!activeStudentId || !activeStudent) return;
      const current = getAnalyseNotes(activeStudent.fiches);
      const data: AnalyseNotes = { ...notes, iopFocus: current.iopFocus };
      setSaveStatus("saving");
      if (previewMode) {
        updateLocalStudent(activeStudentId, (s) => {
          const fiche = {
            id: `${activeStudentId}-fiche-2`,
            student_id: activeStudentId,
            fase: 2,
            data,
            updated_at: new Date().toISOString(),
          };
          return {
            ...s,
            fiches: s.fiches.some((f) => f.fase === 2)
              ? s.fiches.map((f) => (f.fase === 2 ? fiche : f))
              : [...s.fiches, fiche],
          };
        });
        setSaveStatus("saved");
        triggerAutoSave();
        return;
      }
      try {
        const fiche = await saveFicheInDb(activeStudentId, 2, data);
        updateLocalStudent(activeStudentId, (s) => ({
          ...s,
          fiches: s.fiches.some((f) => f.fase === 2)
            ? s.fiches.map((f) => (f.fase === 2 ? fiche : f))
            : [...s.fiches, fiche],
        }));
        setSaveStatus("saved");
        triggerAutoSave();
      } catch (err) {
        console.error("saveAnalyseNotes error:", err);
        setSaveStatus("error");
      }
    },
    [activeStudentId, activeStudent, previewMode, updateLocalStudent, triggerAutoSave]
  );

  const toggleIopFocus = useCallback(
    async (competencyId: string) => {
      if (!activeStudentId || !activeStudent) return;
      const current = getAnalyseNotes(activeStudent.fiches);
      const iopFocus = current.iopFocus.includes(competencyId)
        ? current.iopFocus.filter((id) => id !== competencyId)
        : [...current.iopFocus, competencyId];
      const data: AnalyseNotes = { ...current, iopFocus };
      setSaveStatus("saving");
      if (previewMode) {
        updateLocalStudent(activeStudentId, (s) => {
          const fiche = {
            id: `${activeStudentId}-fiche-2`,
            student_id: activeStudentId,
            fase: 2,
            data,
            updated_at: new Date().toISOString(),
          };
          return {
            ...s,
            fiches: s.fiches.some((f) => f.fase === 2)
              ? s.fiches.map((f) => (f.fase === 2 ? fiche : f))
              : [...s.fiches, fiche],
          };
        });
        setSaveStatus("saved");
        triggerAutoSave();
        return;
      }
      try {
        const fiche = await saveFicheInDb(activeStudentId, 2, data);
        updateLocalStudent(activeStudentId, (s) => ({
          ...s,
          fiches: s.fiches.some((f) => f.fase === 2)
            ? s.fiches.map((f) => (f.fase === 2 ? fiche : f))
            : [...s.fiches, fiche],
        }));
        setSaveStatus("saved");
        triggerAutoSave();
      } catch (err) {
        console.error("toggleIopFocus error:", err);
        setSaveStatus("error");
      }
    },
    [activeStudentId, activeStudent, previewMode, updateLocalStudent, triggerAutoSave]
  );

  const setCompScore = useCallback(
    async (competencyKey: string, milestone: "m1" | "m2" | "m3", value: ScoreValue) => {
      if (!activeStudentId || !activeStudent) return;
      const assessments = getAssessments(activeStudent.competencies);
      const current = assessments[competencyKey] || { m1: "nvt", m2: "nvt", m3: "nvt", note: "" };
      const updated: CompetencyScore = { ...current, [milestone]: value };
      setSaveStatus("saving");
      if (previewMode) {
        updateLocalStudent(activeStudentId, (s) => ({
          ...s,
          competencies: s.competencies.some((c) => c.competency_key === competencyKey)
            ? s.competencies.map((c) =>
                c.competency_key === competencyKey ? { ...c, score: updated } : c
              )
            : [
                ...s.competencies,
                {
                  id: `${activeStudentId}-comp-${competencyKey}`,
                  student_id: activeStudentId,
                  competency_key: competencyKey,
                  score: updated,
                },
              ],
        }));
        setSaveStatus("saved");
        triggerAutoSave();
        return;
      }
      try {
        const comp = await updateCompetencyInDb(activeStudentId, competencyKey, updated);
        updateLocalStudent(activeStudentId, (s) => ({
          ...s,
          competencies: s.competencies.some((c) => c.competency_key === competencyKey)
            ? s.competencies.map((c) => (c.competency_key === competencyKey ? comp : c))
            : [...s.competencies, comp],
        }));
        setSaveStatus("saved");
        triggerAutoSave();
      } catch (err) {
        console.error("setCompScore error:", err);
        setSaveStatus("error");
      }
    },
    [activeStudentId, activeStudent, previewMode, updateLocalStudent, triggerAutoSave]
  );

  const setCompNote = useCallback(
    async (competencyKey: string, note: string) => {
      if (!activeStudentId || !activeStudent) return;
      const assessments = getAssessments(activeStudent.competencies);
      const current = assessments[competencyKey] || { m1: "nvt", m2: "nvt", m3: "nvt", note: "" };
      const updated: CompetencyScore = { ...current, note };
      setSaveStatus("saving");
      if (previewMode) {
        updateLocalStudent(activeStudentId, (s) => ({
          ...s,
          competencies: s.competencies.some((c) => c.competency_key === competencyKey)
            ? s.competencies.map((c) =>
                c.competency_key === competencyKey ? { ...c, score: updated } : c
              )
            : [
                ...s.competencies,
                {
                  id: `${activeStudentId}-comp-${competencyKey}`,
                  student_id: activeStudentId,
                  competency_key: competencyKey,
                  score: updated,
                },
              ],
        }));
        setSaveStatus("saved");
        triggerAutoSave();
        return;
      }
      try {
        const comp = await updateCompetencyInDb(activeStudentId, competencyKey, updated);
        updateLocalStudent(activeStudentId, (s) => ({
          ...s,
          competencies: s.competencies.some((c) => c.competency_key === competencyKey)
            ? s.competencies.map((c) => (c.competency_key === competencyKey ? comp : c))
            : [...s.competencies, comp],
        }));
        setSaveStatus("saved");
        triggerAutoSave();
      } catch (err) {
        console.error("setCompNote error:", err);
        setSaveStatus("error");
      }
    },
    [activeStudentId, activeStudent, previewMode, updateLocalStudent, triggerAutoSave]
  );

  const saveDoorstroomNotes = useCallback(
    async (notes: DoorstroomNotes) => {
      if (!activeStudentId) return;
      setSaveStatus("saving");
      if (previewMode) {
        updateLocalStudent(activeStudentId, (s) => {
          const fiche = {
            id: `${activeStudentId}-fiche-5`,
            student_id: activeStudentId,
            fase: 5,
            data: notes,
            updated_at: new Date().toISOString(),
          };
          return {
            ...s,
            fiches: s.fiches.some((f) => f.fase === 5)
              ? s.fiches.map((f) => (f.fase === 5 ? fiche : f))
              : [...s.fiches, fiche],
          };
        });
        setSaveStatus("saved");
        triggerAutoSave();
        return;
      }
      try {
        const fiche = await saveFicheInDb(activeStudentId, 5, notes);
        updateLocalStudent(activeStudentId, (s) => ({
          ...s,
          fiches: s.fiches.some((f) => f.fase === 5)
            ? s.fiches.map((f) => (f.fase === 5 ? fiche : f))
            : [...s.fiches, fiche],
        }));
        setSaveStatus("saved");
        triggerAutoSave();
      } catch (err) {
        console.error("saveDoorstroomNotes error:", err);
        setSaveStatus("error");
      }
    },
    [activeStudentId, previewMode, updateLocalStudent, triggerAutoSave]
  );

  const addLog = useCallback(
    async (params: { date: string; title: string; content: string; competenciesUsed: string[] }) => {
      if (!activeStudentId) return;
      setSaveStatus("saving");
      if (previewMode) {
        const formattedDate = formatDateToDisplay(params.date);
        const log: Log = {
          id: `preview-log-${Date.now()}`,
          student_id: activeStudentId,
          date: formattedDate,
          title: params.title,
          content: params.content,
          competencies_used: params.competenciesUsed,
        };
        updateLocalStudent(activeStudentId, (s) => ({
          ...s,
          logs: [log, ...s.logs],
        }));
        setSaveStatus("saved");
        triggerAutoSave();
        return;
      }
      try {
        const formattedDate = formatDateToDisplay(params.date);
        const log = await addLogInDb({
          studentId: activeStudentId,
          date: formattedDate,
          title: params.title,
          content: params.content,
          competenciesUsed: params.competenciesUsed,
        });
        updateLocalStudent(activeStudentId, (s) => ({
          ...s,
          logs: [log, ...s.logs],
        }));
        setSaveStatus("saved");
        triggerAutoSave();
      } catch (err) {
        console.error("addLog error:", err);
        setSaveStatus("error");
        throw err;
      }
    },
    [activeStudentId, previewMode, updateLocalStudent, triggerAutoSave]
  );

  const deleteLog = useCallback(
    async (logId: string) => {
      if (!activeStudentId) return;
      setSaveStatus("saving");
      if (previewMode) {
        updateLocalStudent(activeStudentId, (s) => ({
          ...s,
          logs: s.logs.filter((l) => l.id !== logId),
        }));
        setSaveStatus("saved");
        triggerAutoSave();
        return;
      }
      try {
        await deleteLogFromDb(logId);
        updateLocalStudent(activeStudentId, (s) => ({
          ...s,
          logs: s.logs.filter((l) => l.id !== logId),
        }));
        setSaveStatus("saved");
        triggerAutoSave();
      } catch (err) {
        console.error("deleteLog error:", err);
        setSaveStatus("error");
      }
    },
    [activeStudentId, updateLocalStudent, triggerAutoSave]
  );

  const getScreening = useCallback((): ScreeningNotes => {
    if (!activeStudent) return { feedUp: "", feedback: "", feedForward: "" };
    return getScreeningNotes(activeStudent.fiches);
  }, [activeStudent]);

  const getAnalyse = useCallback((): AnalyseNotes => {
    if (!activeStudent) return { klassenraad: "", gesprek: "", iopFocus: [] };
    return getAnalyseNotes(activeStudent.fiches);
  }, [activeStudent]);

  const getDoorstroom = useCallback((): DoorstroomNotes => {
    if (!activeStudent) return { klassenraad: "", advies: "" };
    return getDoorstroomNotes(activeStudent.fiches);
  }, [activeStudent]);

  const getAssessmentsMap = useCallback((): Record<string, CompetencyScore> => {
    if (!activeStudent) return {};
    return getAssessments(activeStudent.competencies);
  }, [activeStudent]);

  const createLessonPreparation = useCallback(
    async (params: {
      title: string;
      notes?: string;
      competencies: string[];
      studentIds: string[];
    }) => {
      setSaveStatus("saving");
      if (previewMode) {
        const prep: LessonPreparation = {
          id: `preview-prep-${Date.now()}`,
          school_id: session.school.id,
          created_by: session.user.id,
          title: params.title,
          notes: params.notes || "",
          competencies: params.competencies,
          student_ids: params.studentIds,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setLessonPreparations((prev) => [prep, ...prev]);
        setSaveStatus("saved");
        triggerAutoSave();
        return prep;
      }
      try {
        const prep = await createLessonPreparationInDb({
          schoolId: session.school.id,
          createdBy: session.user.id,
          title: params.title,
          notes: params.notes,
          competencies: params.competencies,
          studentIds: params.studentIds,
        });
        setLessonPreparations((prev) => [prep, ...prev]);
        setSaveStatus("saved");
        triggerAutoSave();
        return prep;
      } catch (err) {
        console.error("createLessonPreparation error:", err);
        setSaveStatus("error");
        throw err;
      }
    },
    [previewMode, session.school.id, session.user.id, triggerAutoSave]
  );

  const updateLessonPreparation = useCallback(
    async (
      id: string,
      params: {
        title: string;
        notes?: string;
        competencies: string[];
        studentIds: string[];
      }
    ) => {
      setSaveStatus("saving");
      if (previewMode) {
        setLessonPreparations((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  title: params.title,
                  notes: params.notes || "",
                  competencies: params.competencies,
                  student_ids: params.studentIds,
                  updated_at: new Date().toISOString(),
                }
              : p
          )
        );
        setSaveStatus("saved");
        triggerAutoSave();
        return;
      }
      const updated = await updateLessonPreparationInDb(id, {
        title: params.title,
        notes: params.notes || "",
        competencies: params.competencies,
        student_ids: params.studentIds,
      });
      setLessonPreparations((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
      setSaveStatus("saved");
      triggerAutoSave();
    },
    [previewMode, triggerAutoSave]
  );

  const deleteLessonPreparation = useCallback(async (id: string) => {
    setSaveStatus("saving");
    if (previewMode) {
      setLessonPreparations((prev) => prev.filter((p) => p.id !== id));
      setPlannerEvents((prev) =>
        prev.map((e) =>
          e.lesson_preparation_id === id ? { ...e, lesson_preparation_id: null } : e
        )
      );
      setSaveStatus("saved");
      triggerAutoSave();
      return;
    }
    await deleteLessonPreparationFromDb(id);
    setLessonPreparations((prev) => prev.filter((p) => p.id !== id));
    setPlannerEvents((prev) =>
      prev.map((e) =>
        e.lesson_preparation_id === id
          ? { ...e, lesson_preparation_id: null }
          : e
      )
    );
    setSaveStatus("saved");
    triggerAutoSave();
  }, [previewMode, triggerAutoSave]);

  const createPlannerEvent = useCallback(
    async (params: {
      eventDate: string;
      assignmentTitle: string;
      assignmentNotes?: string;
      lessonPreparationId?: string | null;
      studentIds: string[];
    }) => {
      setSaveStatus("saving");
      if (previewMode) {
        const event: PlannerEvent = {
          id: `preview-event-${Date.now()}`,
          school_id: session.school.id,
          event_date: params.eventDate,
          assignment_title: params.assignmentTitle,
          assignment_notes: params.assignmentNotes || "",
          lesson_preparation_id: params.lessonPreparationId ?? null,
          student_ids: params.studentIds,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setPlannerEvents((prev) => [event, ...prev]);
        setSaveStatus("saved");
        triggerAutoSave();
        return;
      }
      const event = await createPlannerEventInDb({
        schoolId: session.school.id,
        eventDate: params.eventDate,
        assignmentTitle: params.assignmentTitle,
        assignmentNotes: params.assignmentNotes,
        lessonPreparationId: params.lessonPreparationId,
        studentIds: params.studentIds,
      });
      setPlannerEvents((prev) => [event, ...prev]);
      setSaveStatus("saved");
      triggerAutoSave();
    },
    [previewMode, session.school.id, triggerAutoSave]
  );

  const updatePlannerEvent = useCallback(
    async (
      id: string,
      params: {
        eventDate: string;
        assignmentTitle: string;
        assignmentNotes?: string;
        lessonPreparationId?: string | null;
        studentIds: string[];
      }
    ) => {
      setSaveStatus("saving");
      if (previewMode) {
        setPlannerEvents((prev) =>
          prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  event_date: params.eventDate,
                  assignment_title: params.assignmentTitle,
                  assignment_notes: params.assignmentNotes || "",
                  lesson_preparation_id: params.lessonPreparationId ?? null,
                  student_ids: params.studentIds,
                  updated_at: new Date().toISOString(),
                }
              : e
          )
        );
        setSaveStatus("saved");
        triggerAutoSave();
        return;
      }
      const updated = await updatePlannerEventInDb(id, {
        event_date: params.eventDate,
        assignment_title: params.assignmentTitle,
        assignment_notes: params.assignmentNotes || "",
        lesson_preparation_id: params.lessonPreparationId ?? null,
        student_ids: params.studentIds,
      });
      setPlannerEvents((prev) =>
        prev.map((e) => (e.id === id ? updated : e))
      );
      setSaveStatus("saved");
      triggerAutoSave();
    },
    [previewMode, triggerAutoSave]
  );

  const deletePlannerEvent = useCallback(async (id: string) => {
    setSaveStatus("saving");
    if (previewMode) {
      setPlannerEvents((prev) => prev.filter((e) => e.id !== id));
      setSaveStatus("saved");
      triggerAutoSave();
      return;
    }
    await deletePlannerEventFromDb(id);
    setPlannerEvents((prev) => prev.filter((e) => e.id !== id));
    setSaveStatus("saved");
    triggerAutoSave();
  }, [previewMode, triggerAutoSave]);

  useEffect(() => {
    if (previewMode) return;

    const supabase = createClient();
    const schoolId = session.school.id;

    const studentsChannel = supabase
      .channel(`students:${schoolId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students", filter: `school_id=eq.${schoolId}` },
        () => {
          fetchStudents();
        }
      )
      .subscribe();

    const logsChannel = supabase
      .channel(`logs:${schoolId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "logs" }, () => {
        fetchStudents();
      })
      .subscribe();

    const competenciesChannel = supabase
      .channel(`competencies:${schoolId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "competencies" }, () => {
        fetchStudents();
      })
      .subscribe();

    realtimeChannels.current = [studentsChannel, logsChannel, competenciesChannel];

    return () => {
      realtimeChannels.current.forEach((ch) => {
        supabase.removeChannel(ch);
      });
    };
  }, [previewMode, session.school.id, fetchStudents]);

  const value: AppContextValue = {
    previewMode,
    session,
    students,
    activeStudent,
    activeStudentId,
    loading,
    saveStatus,
    mainTab,
    onlyShowIopFocus,
    setMainTab,
    setOnlyShowIopFocus,
    switchStudent,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    setProcessStep,
    saveScreeningNotes,
    saveAnalyseNotes,
    toggleIopFocus,
    setCompScore,
    setCompNote,
    saveDoorstroomNotes,
    addLog,
    deleteLog,
    forceSync,
    getScreening,
    getAnalyse,
    getDoorstroom,
    getAssessmentsMap,
    lessonPreparations,
    plannerEvents,
    fetchPlannerData,
    createLessonPreparation,
    updateLessonPreparation,
    deleteLessonPreparation,
    createPlannerEvent,
    updatePlannerEvent,
    deletePlannerEvent,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export type { AppUser, School, Log };
