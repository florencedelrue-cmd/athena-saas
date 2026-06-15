"use client";

import { useApp } from "@/context/AppContext";
import { COMPETENCIES_DATA, SCORE_COLORS } from "@/lib/constants";
import { EmptyState } from "@/components/ui/Loading";
import type { CompetencyDomainKey } from "@/types";

export function IopTrackerList() {
  const { getAnalyse, getAssessmentsMap } = useApp();
  const iopFocus = getAnalyse().iopFocus;
  const assessments = getAssessmentsMap();

  if (iopFocus.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-xs space-y-4 md:col-span-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          IOP Focus Competentie Status
        </span>
        <EmptyState message="Er zijn nog geen competenties geselecteerd binnen het IOP (fase Analyse)." />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-xs space-y-4 md:col-span-2">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
        IOP Focus Competentie Status
      </span>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {iopFocus.map((itemId) => {
          let compInfo = null;
          (Object.keys(COMPETENCIES_DATA) as CompetencyDomainKey[]).forEach(
            (domainKey) => {
              const match = COMPETENCIES_DATA[domainKey].items.find(
                (item) => item.id === itemId
              );
              if (match) compInfo = match;
            }
          );
          if (!compInfo) return null;

          const score = assessments[itemId] || {
            m1: "nvt" as const,
            m2: "nvt" as const,
            m3: "nvt" as const,
            note: "",
          };

          return (
            <div
              key={itemId}
              className="border border-slate-100 rounded-2xl p-4 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
            >
              <div className="space-y-1">
                <span className="font-black text-athenaBlue text-[10px] uppercase">
                  {itemId}
                </span>
                <h4 className="font-bold text-xs text-slate-700 leading-snug">
                  {compInfo.title.split(": ")[1]}
                </h4>
              </div>
              <div className="flex items-center space-x-2 overflow-x-auto">
                <div className="flex space-x-1">
                  {(["m1", "m2", "m3"] as const).map((m) => (
                    <span
                      key={m}
                      className={`text-[9px] px-2 py-1 rounded-md font-bold uppercase whitespace-nowrap ${
                        SCORE_COLORS[score[m]]
                      }`}
                    >
                      {m.toUpperCase()}: {score[m].toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
