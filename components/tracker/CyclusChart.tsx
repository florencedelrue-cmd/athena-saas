"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { SCORE_MAP } from "@/lib/constants";

export function CyclusChart() {
  const { getAssessmentsMap } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [growthPct, setGrowthPct] = useState(0);
  const [svgHtml, setSvgHtml] = useState("");

  useEffect(() => {
    const assessments = getAssessmentsMap();
    const sums = {
      m1: { total: 0, count: 0 },
      m2: { total: 0, count: 0 },
      m3: { total: 0, count: 0 },
    };

    Object.values(assessments).forEach((assess) => {
      const s1 = SCORE_MAP[assess.m1] ?? 0;
      const s2 = SCORE_MAP[assess.m2] ?? 0;
      const s3 = SCORE_MAP[assess.m3] ?? 0;
      if (s1 > 0) { sums.m1.total += s1; sums.m1.count++; }
      if (s2 > 0) { sums.m2.total += s2; sums.m2.count++; }
      if (s3 > 0) { sums.m3.total += s3; sums.m3.count++; }
    });

    const getAvg = (sumInfo: { total: number; count: number }) =>
      sumInfo.count > 0 ? sumInfo.total / sumInfo.count : 1.0;
    const avg1 = getAvg(sums.m1);
    const avg2 = getAvg(sums.m2);
    const avg3 = getAvg(sums.m3);

    const width = containerRef.current?.clientWidth || 300;
    const height = 220;
    const pad = 40;

    const x1 = pad + (width - 2 * pad) * 0.1;
    const x2 = pad + (width - 2 * pad) * 0.5;
    const x3 = pad + (width - 2 * pad) * 0.9;

    const getY = (val: number) =>
      height - pad - ((val - 1.0) / 3.0) * (height - 2 * pad);

    setSvgHtml(`
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <line x1="${pad}" y1="${getY(1)}" x2="${width - pad}" y2="${getY(1)}" stroke="#e2e8f0" stroke-dasharray="3,3" />
        <line x1="${pad}" y1="${getY(2)}" x2="${width - pad}" y2="${getY(2)}" stroke="#e2e8f0" stroke-dasharray="3,3" />
        <line x1="${pad}" y1="${getY(3)}" x2="${width - pad}" y2="${getY(3)}" stroke="#e2e8f0" stroke-dasharray="3,3" />
        <line x1="${pad}" y1="${getY(4)}" x2="${width - pad}" y2="${getY(4)}" stroke="#e2e8f0" stroke-dasharray="3,3" />
        <text x="${pad - 8}" y="${getY(1) + 4}" font-size="9" fill="#94a3b8" text-anchor="end">Zelden</text>
        <text x="${pad - 8}" y="${getY(2) + 4}" font-size="9" fill="#94a3b8" text-anchor="end">Soms</text>
        <text x="${pad - 8}" y="${getY(3) + 4}" font-size="9" fill="#94a3b8" text-anchor="end">Meestal</text>
        <text x="${pad - 8}" y="${getY(4) + 4}" font-size="9" fill="#94a3b8" text-anchor="end">Altijd</text>
        <path d="M ${x1} ${getY(avg1)} L ${x2} ${getY(avg2)} L ${x3} ${getY(avg3)}" fill="none" stroke="#0f4c81" stroke-width="4" stroke-linecap="round"/>
        <circle cx="${x1}" cy="${getY(avg1)}" r="6" fill="#0f4c81" />
        <circle cx="${x2}" cy="${getY(avg2)}" r="6" fill="#0d9488" />
        <circle cx="${x3}" cy="${getY(avg3)}" r="6" fill="#d81b60" />
        <text x="${x1}" y="${height - 15}" font-size="10" font-weight="bold" fill="#475569" text-anchor="middle">M1: Start</text>
        <text x="${x2}" y="${height - 15}" font-size="10" font-weight="bold" fill="#475569" text-anchor="middle">M2: Midden</text>
        <text x="${x3}" y="${height - 15}" font-size="10" font-weight="bold" fill="#475569" text-anchor="middle">M3: Eind</text>
      </svg>
    `);

    let total = 0;
    let achieved = 0;
    Object.values(assessments).forEach((assess) => {
      const last =
        assess.m3 !== "nvt"
          ? assess.m3
          : assess.m2 !== "nvt"
          ? assess.m2
          : assess.m1;
      if (last !== "nvt" && last) {
        total++;
        if (last === "altijd" || last === "meestal") achieved++;
      }
    });
    setGrowthPct(total > 0 ? Math.round((achieved / total) * 100) : 0);
  }, [getAssessmentsMap]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-xs space-y-4 md:col-span-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Globale Groeicurve (M1 ➔ M3)
        </span>
        <span className="bg-athenaBlue/10 text-athenaBlue text-[11px] font-bold px-2.5 py-1 rounded-full">
          Globale groei: {growthPct}%
        </span>
      </div>
      <div
        ref={containerRef}
        className="w-full h-56 relative flex justify-center items-center bg-slate-50 rounded-2xl border border-slate-100"
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
      <div className="text-[11px] text-slate-500 leading-relaxed p-2 bg-slate-50 rounded-xl border border-slate-100">
        Deze curve toont het gemiddelde resultaat van alle competenties over de
        drie formele meetmomenten (M1: Start, M2: Midden, M3: Eind).
      </div>
    </div>
  );
}
