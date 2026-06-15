"use client";

import { ClipboardList, Target } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { COMPETENCIES_DATA } from "@/lib/constants";
import { useCallback, useEffect, useState } from "react";
import type { CompetencyDomainKey } from "@/types";

export function AnalyseCard() {
  const { getAnalyse, saveAnalyseNotes, toggleIopFocus } = useApp();
  const [klassenraad, setKlassenraad] = useState("");
  const [gesprek, setGesprek] = useState("");
  const [iopFocus, setIopFocus] = useState<string[]>([]);

  useEffect(() => {
    const analyse = getAnalyse();
    setKlassenraad(analyse.klassenraad);
    setGesprek(analyse.gesprek);
    setIopFocus(analyse.iopFocus);
  }, [getAnalyse]);

  const handleNotesBlur = useCallback(() => {
    saveAnalyseNotes({ klassenraad, gesprek });
  }, [klassenraad, gesprek, saveAnalyseNotes]);

  const handleToggle = async (itemId: string) => {
    await toggleIopFocus(itemId);
    const analyse = getAnalyse();
    setIopFocus(analyse.iopFocus);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <ClipboardList className="w-4.5 h-4.5 text-athenaBlue" />
          <span>Analyse van het Starttraject</span>
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Analyse van de Screeningsklassenraad
            </label>
            <textarea
              value={klassenraad}
              onChange={(e) => setKlassenraad(e.target.value)}
              onBlur={handleNotesBlur}
              rows={4}
              placeholder="Wat kwam er naar voren uit de klassenraad? Welke adviezen zijn er gegeven?..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Verslag gesprek met de leerling
            </label>
            <textarea
              value={gesprek}
              onChange={(e) => setGesprek(e.target.value)}
              onBlur={handleNotesBlur}
              rows={4}
              placeholder="Wat gaf de leerling zelf aan tijdens het gesprek? Wat zijn de verwachtingen?..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4.5 h-4.5 text-athenaBlue" />
            <span>Individueel OpleidingsPlan (IOP)</span>
          </h3>
          <span className="bg-athenaBlue/10 text-athenaBlue font-bold text-[10px] px-2.5 py-0.5 rounded-full">
            {iopFocus.length} geselecteerd
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Vink hieronder de specifieke competenties aan die we gaan opvolgen en
          evalueren binnen het IOP van deze leerling. Deze vormen de{" "}
          <b>fase focus</b> in de competentiemeter en de tracker.
        </p>
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {(Object.keys(COMPETENCIES_DATA) as CompetencyDomainKey[]).map(
            (domainKey) => {
              const domain = COMPETENCIES_DATA[domainKey];
              return (
                <div key={domainKey}>
                  <div className="font-bold text-xs text-slate-400 mt-4 mb-2 uppercase tracking-wide border-b pb-1">
                    {domain.title}
                  </div>
                  {domain.items.map((item) => {
                    const isChecked = iopFocus.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggle(item.id)}
                          className="mt-1 rounded text-athenaBlue focus:ring-athenaBlue w-4 h-4"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-800">
                            {item.id.toUpperCase()}:
                          </span>{" "}
                          <span className="text-slate-600 leading-snug">
                            {item.title.split(": ")[1]}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
