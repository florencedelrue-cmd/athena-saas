"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { SCORE_MAP } from "@/lib/constants";
import { PERIOD_KEYS, PERIOD_LABELS, latestPeriodScore } from "@/lib/competency-score";

export function CyclusChart() {
  const { getAssessmentsMap } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [growthPct, setGrowthPct] = useState(0);
  const [svgHtml, setSvgHtml] = useState("");

  useEffect(() => {
    const assessments = getAssessmentsMap();
    const sums = PERIOD_KEYS.reduce(
      (acc, key) => {
        acc[key] = { total: 0, count: 0 };
        return acc;
      },
      {} as Record<(typeof PERIOD_KEYS)[number], { total: number; count: number }>
    );

    Object.values(assessments).forEach((assess) => {
      PERIOD_KEYS.forEach((period) => {
        const value = SCORE_MAP[assess[period]] ?? 0;
        if (value > 0) {
          sums[period].total += value;
          sums[period].count++;
        }
      });
    });

    const getAvg = (sumInfo: { total: number; count: number }) =>
      sumInfo.count > 0 ? sumInfo.total / sumInfo.count : 1.0;

    const avgs = PERIOD_KEYS.map((period) => getAvg(sums[period]));

    const width = containerRef.current?.clientWidth || 300;
    const height = 220;
    const pad = 40;

    const xPositions = PERIOD_KEYS.map((_, index) => {
      const ratio = index / (PERIOD_KEYS.length - 1);
      return pad + (width - 2 * pad) * (0.05 + ratio * 0.9);
    });

    const getY = (val: number) =>
      height - pad - ((val - 1.0) / 3.0) * (height - 2 * pad);

    const pathPoints = xPositions
      .map((x, index) => `${index === 0 ? "M" : "L"} ${x} ${getY(avgs[index])}`)
      .join(" ");

    const circles = xPositions
      .map(
        (x, index) =>
          `<circle cx="${x}" cy="${getY(avgs[index])}" r="6" fill="${
            index === 0 ? "#0f4c81" : index === PERIOD_KEYS.length - 1 ? "#d81b60" : "#0d9488"
          }" />`
      )
      .join("");

    const labels = xPositions
      .map(
        (x, index) =>
          `<text x="${x}" y="${height - 15}" font-size="10" font-weight="bold" fill="#475569" text-anchor="middle">${PERIOD_LABELS[PERIOD_KEYS[index]]}</text>`
      )
      .join("");

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
        <path d="${pathPoints}" fill="none" stroke="#0f4c81" stroke-width="4" stroke-linecap="round"/>
        ${circles}
        ${labels}
      </svg>
    `);

    let total = 0;
    let achieved = 0;
    Object.values(assessments).forEach((assess) => {
      const last = latestPeriodScore(assess);
      if (last !== "nvt") {
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
          Feedcyclus — Groeicurve (PER 1 ➔ PER 4)
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
        vier periodes (PER 1 t.e.m. PER 4).
      </div>
    </div>
  );
}
