"use client";

import { RefreshCw } from "lucide-react";
import { AthenaLogo } from "@/components/AthenaLogo";
import { useApp } from "@/context/AppContext";
import type { MainTab } from "@/types";

export function Header() {
  const { mainTab, setMainTab, saveStatus, forceSync, session, previewMode } = useApp();

  const statusText = {
    idle: "⚡ Live opslaan actief",
    detected: "⏳ Wijziging gedetecteerd...",
    saving: "💾 Bezig met opslaan...",
    saved: "⚡ Volledig bijgewerkt",
    error: "⚠️ Fout bij opslaan",
  }[saveStatus];

  const switchTab = (tab: MainTab) => {
    setMainTab(tab);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <AthenaLogo priority />
          <span className="bg-athenaPink text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded hidden sm:inline">
            TOCI 2.0
          </span>
        </div>

        <nav className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => switchTab("gesprek")}
            className={`tab-btn px-4 md:px-6 py-3 md:py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              mainTab === "gesprek"
                ? "bg-white text-athenaBlue shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Gespreksfiche
          </button>
          <button
            onClick={() => switchTab("volgsysteem")}
            className={`tab-btn px-4 md:px-6 py-3 md:py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              mainTab === "volgsysteem"
                ? "bg-white text-athenaBlue shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cyclus Tracker
          </button>
          <button
            onClick={() => switchTab("planner")}
            className={`tab-btn px-4 md:px-6 py-3 md:py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              mainTab === "planner"
                ? "bg-white text-athenaBlue shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Planner
          </button>
        </nav>

        <div className="flex items-center space-x-3 justify-end">
          <div className="hidden lg:block text-right">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">{session.school.name}</p>
            {!previewMode && (
              <p className="text-[10px] text-slate-500">
                {session.user.email} · {session.user.role}
              </p>
            )}
          </div>
          <span className="text-xs text-slate-400 font-semibold italic hidden sm:inline">
            {statusText}
          </span>
          <button
            onClick={() => forceSync()}
            className="p-3 md:p-2 text-slate-400 hover:text-athenaBlue rounded-xl hover:bg-slate-50 transition"
            title="Nu handmatig synchroniseren"
          >
            <RefreshCw
              className={`w-4 h-4 ${saveStatus === "saving" ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
