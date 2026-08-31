"use client";

import { GraduationCap } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { isUserEditing } from "@/lib/form-sync";
import { useDebouncedSave } from "@/lib/use-debounced-save";
import { useEffect, useState } from "react";
import type { DoorstroomNotes } from "@/types";

export function DoorstroomCard() {
  const { activeStudentId, getDoorstroom, saveDoorstroomNotes } = useApp();
  const [notes, setNotes] = useState<DoorstroomNotes>({ klassenraad: "", advies: "" });

  useEffect(() => {
    if (isUserEditing()) return;
    setNotes(getDoorstroom());
  }, [getDoorstroom, activeStudentId]);

  useDebouncedSave(notes, saveDoorstroomNotes);

  return (
    <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center space-x-3 text-athenaBlue">
        <GraduationCap className="w-6 h-6" />
        <h3 className="text-base font-bold text-slate-800">
          Evaluatie & doorstroomadvies
        </h3>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">
        Formuleer hieronder het definitieve eindrapport of doorstroomadvies op
        basis van de behaalde competenties tijdens het traject.
      </p>
      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Eindbeoordeling van de klassenraad
          </label>
          <textarea
            value={notes.klassenraad}
            onChange={(e) => setNotes({ ...notes, klassenraad: e.target.value })}
            rows={5}
            placeholder="Welk eindoordeel of advies formuleert de klassenraad? Is de leerling klaar voor doorstroom naar de arbeidsmarkt?..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Transitie-advies en afspraken voor de toekomst
          </label>
          <textarea
            value={notes.advies}
            onChange={(e) => setNotes({ ...notes, advies: e.target.value })}
            rows={5}
            placeholder="Wat zijn de concrete afspraken voor het vervolg van de loopbaan of het traject?..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue"
          />
        </div>
      </div>
    </div>
  );
}
