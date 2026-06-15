"use client";

import { Compass, CheckCircle, TrendingUp } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useCallback, useEffect, useState } from "react";
import type { ScreeningNotes } from "@/types";

export function ScreeningCard() {
  const { getScreening, saveScreeningNotes } = useApp();
  const [notes, setNotes] = useState<ScreeningNotes>({
    feedUp: "",
    feedback: "",
    feedForward: "",
  });

  useEffect(() => {
    setNotes(getScreening());
  }, [getScreening]);

  const handleChange = useCallback(
    (field: keyof ScreeningNotes, value: string) => {
      const updated = { ...notes, [field]: value };
      setNotes(updated);
    },
    [notes]
  );

  const handleBlur = useCallback(
    (field: keyof ScreeningNotes) => {
      saveScreeningNotes(notes);
    },
    [notes, saveScreeningNotes]
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 leading-relaxed">
        <span className="font-bold">1. Screening (Beginsituatie):</span> Deze fase
        dient om de beginsituatie van de leerling volledig in kaart te brengen. Vul
        de reflexieve velden hieronder in om een helder startpunt te definiëren. Er
        worden in deze fase geen scores toegekend.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="bg-blue-50 border-b border-slate-100 px-4 md:px-6 py-4 flex items-center space-x-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-sm text-blue-800">
              1. FEED-UP: Waar ga ik naartoe?
            </span>
          </div>
          <div className="p-4 md:p-6">
            <textarea
              value={notes.feedUp}
              onChange={(e) => handleChange("feedUp", e.target.value)}
              onBlur={() => handleBlur("feedUp")}
              rows={6}
              placeholder="Wat zijn de doelen, motivatie en verwachtingen van deze leerling bij de start?..."
              className="w-full text-sm text-slate-700 placeholder-slate-400 outline-none resize-none bg-transparent"
            />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="bg-emerald-50 border-b border-slate-100 px-4 md:px-6 py-4 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-sm text-emerald-800">
              2. FEEDBACK: Waar sta ik nu?
            </span>
          </div>
          <div className="p-4 md:p-6">
            <textarea
              value={notes.feedback}
              onChange={(e) => handleChange("feedback", e.target.value)}
              onBlur={() => handleBlur("feedback")}
              rows={6}
              placeholder="Wat zijn de sterktes en reeds geobserveerde talenten bij de start?..."
              className="w-full text-sm text-slate-700 placeholder-slate-400 outline-none resize-none bg-transparent"
            />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="bg-amber-50 border-b border-slate-100 px-4 md:px-6 py-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-sm text-amber-800">
              3. FEEDFORWARD: Hoe kom ik daar?
            </span>
          </div>
          <div className="p-4 md:p-6">
            <textarea
              value={notes.feedForward}
              onChange={(e) => handleChange("feedForward", e.target.value)}
              onBlur={() => handleBlur("feedForward")}
              rows={6}
              placeholder="Welke concrete afspraken maken we om de start vlekkeloos te laten verlopen?..."
              className="w-full text-sm text-slate-700 placeholder-slate-400 outline-none resize-none bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
