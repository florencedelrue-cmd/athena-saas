"use client";

import { useApp } from "@/context/AppContext";
import { COMPETENCIES_DATA } from "@/lib/constants";
import type { CompetencyDomainKey } from "@/types";

export function FrequencyTracker() {
  const { activeStudent, getAnalyse } = useApp();
  const iopFocus = getAnalyse().iopFocus;
  const logs = activeStudent?.logs ?? [];

  const freqMap: Record<string, number> = {};
  (Object.keys(COMPETENCIES_DATA) as CompetencyDomainKey[]).forEach((dk) => {
    COMPETENCIES_DATA[dk].items.forEach((item) => {
      freqMap[item.id] = 0;
    });
  });

  logs.forEach((log) => {
    if (log.competencies_used) {
      log.competencies_used.forEach((cId) => {
        const cleanId = cId.toLowerCase();
        if (freqMap[cleanId] !== undefined) freqMap[cleanId]++;
      });
    }
  });

  const maxFreq = Math.max(...Object.values(freqMap), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-xs space-y-4">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
        Werkplek Activiteit & Competentiefrequentie
      </span>
      <p className="text-xs text-slate-500 leading-relaxed">
        Hieronder ziet u hoe vaak er aan specifieke competenties is gewerkt
        tijdens de lessen en werkplekactiviteiten in de fase{" "}
        <b>Uitvoering</b>.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.keys(freqMap).map((id) => {
          const count = freqMap[id];
          const pct = (count / maxFreq) * 100;
          let cleanTitle = "";
          (Object.keys(COMPETENCIES_DATA) as CompetencyDomainKey[]).forEach(
            (dk) => {
              const match = COMPETENCIES_DATA[dk].items.find(
                (item) => item.id === id
              );
              if (match) cleanTitle = match.title.split(": ")[1];
            }
          );
          const isIopFocus = iopFocus.includes(id);

          return (
            <div
              key={id}
              className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 uppercase flex items-center gap-1">
                  {id} {isIopFocus ? "⭐" : ""}
                </span>
                <span className="bg-athenaGreen/10 text-athenaGreen font-black px-2 py-0.5 rounded-full text-[10px]">
                  {count}x
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-athenaGreen transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[9.5px] text-slate-400 line-clamp-1">
                {cleanTitle}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
