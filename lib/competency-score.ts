import type { CompetencyScore, ScoreValue } from "@/types";

export const PERIOD_KEYS = ["per1", "per2", "per3", "per4"] as const;
export type PeriodKey = (typeof PERIOD_KEYS)[number];

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  per1: "PER 1",
  per2: "PER 2",
  per3: "PER 3",
  per4: "PER 4",
};

export function normalizeCompetencyScore(raw: unknown): CompetencyScore {
  const score = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const pick = (perKey: PeriodKey, legacyKey: string): ScoreValue => {
    const value = score[perKey] ?? score[legacyKey];
    if (
      value === "zelden" ||
      value === "soms" ||
      value === "meestal" ||
      value === "altijd" ||
      value === "nvt"
    ) {
      return value;
    }
    return "nvt";
  };

  return {
    per1: pick("per1", "m1"),
    per2: pick("per2", "m2"),
    per3: pick("per3", "m3"),
    per4: pick("per4", "m4"),
    note: typeof score.note === "string" ? score.note : "",
  };
}

export function latestPeriodScore(score: CompetencyScore): ScoreValue {
  for (let i = PERIOD_KEYS.length - 1; i >= 0; i--) {
    const value = score[PERIOD_KEYS[i]];
    if (value !== "nvt") return value;
  }
  return "nvt";
}
