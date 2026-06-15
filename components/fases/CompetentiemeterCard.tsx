"use client";

import { Eye, EyeOff, Wrench, Compass, Users } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { COMPETENCIES_DATA, SCORING_SCALE } from "@/lib/constants";
import { useCallback, useEffect, useState } from "react";
import type { CompetencyDomainKey, CompetencyScore, ScoreValue } from "@/types";

export function CompetentiemeterCard() {
  const {
    onlyShowIopFocus,
    setOnlyShowIopFocus,
    getAnalyse,
    getAssessmentsMap,
    setCompScore,
    setCompNote,
  } = useApp();
  const [assessments, setAssessments] = useState<Record<string, CompetencyScore>>({});
  const [iopFocus, setIopFocus] = useState<string[]>([]);

  useEffect(() => {
    setAssessments(getAssessmentsMap());
    setIopFocus(getAnalyse().iopFocus);
  }, [getAssessmentsMap, getAnalyse]);

  const focusSet = new Set(iopFocus);

  const handleScore = useCallback(
    async (itemId: string, milestone: "m1" | "m2" | "m3", value: ScoreValue) => {
      await setCompScore(itemId, milestone, value);
      setAssessments(getAssessmentsMap());
    },
    [setCompScore, getAssessmentsMap]
  );

  const handleNote = useCallback(
    async (itemId: string, note: string) => {
      await setCompNote(itemId, note);
    },
    [setCompNote]
  );

  const domainIcons: Record<CompetencyDomainKey, typeof Wrench> = {
    vt: Wrench,
    lb: Compass,
    am: Users,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-x-6 gap-y-2 text-xs items-center shadow-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider">
            Scorelegenda:
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>Z (Zelden)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>S (Soms)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>M (Meestal)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>A (Altijd)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-300"></span>⚪ N.v.t.
          </span>
        </div>
        <button
          onClick={() => setOnlyShowIopFocus(!onlyShowIopFocus)}
          className={`font-bold text-xs px-4 py-3 md:py-2.5 rounded-xl transition flex items-center space-x-1.5 ${
            onlyShowIopFocus
              ? "bg-athenaBlue text-white"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          {onlyShowIopFocus ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          <span>
            {onlyShowIopFocus ? "Toon alle competenties" : "Toon alleen IOP Focus"}
          </span>
        </button>
      </div>

      <div className="space-y-6">
        {(Object.keys(COMPETENCIES_DATA) as CompetencyDomainKey[]).map((domainKey) => {
          const domain = COMPETENCIES_DATA[domainKey];
          const filteredItems = domain.items.filter((item) => {
            if (onlyShowIopFocus) return focusSet.has(item.id);
            return true;
          });
          if (filteredItems.length === 0) return null;

          const DomainIcon = domainIcons[domainKey];

          return (
            <div
              key={domainKey}
              className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xs"
            >
              <div className="bg-slate-50 px-4 md:px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <DomainIcon className="w-5 h-5 text-athenaBlue" />
                  <span>{domain.title}</span>
                </span>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                {filteredItems.map((item) => {
                  const isIopFocus = focusSet.has(item.id);
                  const score = assessments[item.id] || {
                    m1: "nvt" as const,
                    m2: "nvt" as const,
                    m3: "nvt" as const,
                    note: "",
                  };

                  return (
                    <div
                      key={item.id}
                      className={`border ${
                        isIopFocus
                          ? "border-yellow-200 bg-yellow-50/20 fase-active-glow"
                          : "border-slate-100 bg-slate-50/50"
                      } rounded-2xl p-4 space-y-3 transition-all duration-200`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-3">
                          <span
                            className={`w-5 h-5 rounded-full ${
                              isIopFocus
                                ? "bg-yellow-400 text-yellow-900"
                                : "bg-slate-200 text-slate-700"
                            } flex items-center justify-center text-xs font-bold flex-shrink-0`}
                          >
                            {isIopFocus ? "★" : "•"}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-800 leading-snug">
                              {item.title}
                            </div>
                            <div className="text-[10.5px] text-slate-500 mt-1 whitespace-pre-line leading-relaxed">
                              {item.bullets.join("\n")}
                            </div>
                          </div>
                        </div>
                        {isIopFocus && (
                          <span className="bg-yellow-100 text-yellow-800 font-bold text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1">
                            ⭐ IOP FOCUS
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                        {(["m1", "m2", "m3"] as const).map((milestone) => (
                          <div
                            key={milestone}
                            className="flex items-center justify-between text-xs p-1 bg-white/70 rounded-lg border border-slate-100"
                          >
                            <span className="text-slate-400 font-semibold">
                              {milestone === "m1"
                                ? "M1: Start"
                                : milestone === "m2"
                                ? "M2: Midden"
                                : "M3: Eind"}
                              :
                            </span>
                            <div className="flex space-x-1">
                              {SCORING_SCALE.map((scale) => {
                                const isSelected = score[milestone] === scale.key;
                                return (
                                  <button
                                    key={scale.key}
                                    onClick={() =>
                                      handleScore(item.id, milestone, scale.key)
                                    }
                                    title={scale.label}
                                    className={`w-7 h-7 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                                      isSelected
                                        ? scale.color
                                        : "bg-white text-slate-400 border-slate-200 hover:bg-slate-100"
                                    }`}
                                  >
                                    {scale.icon}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <input
                        type="text"
                        defaultValue={score.note || ""}
                        onBlur={(e) => handleNote(item.id, e.target.value)}
                        placeholder="Specifieke opmerkingen, bewijzen of werkpleknota's..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 md:py-1.5 text-xs text-slate-700 outline-none focus:border-athenaBlue"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
