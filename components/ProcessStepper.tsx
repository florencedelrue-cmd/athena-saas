"use client";

import {
  Compass,
  FileSearch,
  Sliders,
  Activity,
  LogOut,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const STEPS = [
  { num: 1, label: "1. Screening", icon: Compass },
  { num: 2, label: "2. Analyse screeningsklassenraad", icon: FileSearch },
  { num: 3, label: "3. Competentiemeter", icon: Sliders },
  { num: 4, label: "4. Uitvoering", icon: Activity },
  { num: 5, label: "5. Doorstroom", icon: LogOut },
];

export function ProcessStepper() {
  const { activeStudent, setProcessStep } = useApp();
  const currentStep = activeStudent?.process_step ?? 1;

  return (
    <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
        Actieve Procesfase voor Invoer
      </span>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 overflow-x-auto">
        {STEPS.map(({ num, label, icon: Icon }) => (
          <button
            key={num}
            onClick={() => setProcessStep(num)}
            className={`step-btn py-3 px-3 border rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
              currentStep === num
                ? "bg-athenaBlue border-athenaBlue text-white shadow-xs"
                : "bg-white border-slate-200 text-slate-500 hover:border-athenaBlue hover:text-athenaBlue"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
