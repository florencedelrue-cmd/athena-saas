"use client";

import { RefreshCw } from "lucide-react";
import { AthenaLogo } from "@/components/AthenaLogo";
import { useApp } from "@/context/AppContext";
import type { MainTab } from "@/types";

export function Header() {
  const {
    mainTab,
    setMainTab,
    plannerOpen,
    setPlannerOpen,
    saveStatus,
    forceSync,
    session,
    previewMode,
  } = useApp();

  const statusText = previewMode
    ? {
        idle: "💾 Lokaal opgeslagen (deze browser)",
        detected: "⏳ Wijziging gedetecteerd...",
        saving: "💾 Bezig met opslaan...",
        saved: "💾 Lokaal opgeslagen (deze browser)",
        error: "⚠️ Fout bij opslaan",
      }[saveStatus]
    : {
        idle: "⚡ Live sync actief",
        detected: "⏳ Wijziging gedetecteerd...",
        saving: "💾 Bezig met opslaan...",
        saved: "⚡ Volledig bijgewerkt",
        error: "⚠️ Fout bij opslaan",
      }[saveStatus];

  const switchTab = (tab: MainTab) => {
    setPlannerOpen(false);
    setMainTab(tab);
  };

  const togglePlanner = () => {
    setPlannerOpen(!plannerOpen);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col items-start shrink-0">
          <AthenaLogo priority />
          <span className="text-[10px] font-extrabold text-athenaPink mt-1 leading-none">
            TOCI 2.0
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-1 lg:justify-center">
          <button
            type="button"
            onClick={togglePlanner}
            className={`text-xs font-extrabold px-4 py-2.5 rounded-lg transition whitespace-nowrap shadow-sm ${
              plannerOpen
                ? "bg-athenaBlue text-white shadow-md ring-2 ring-athenaBlue/30"
                : "bg-athenaGreen text-white hover:bg-[#0b7a71] shadow-md ring-2 ring-athenaGreen/25"
            }`}
          >
            PLANNER LKR
          </button>

          {!plannerOpen && (
            <nav className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto">
              <button
                onClick={() => switchTab("gesprek")}
                className={`tab-btn px-4 md:px-6 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  mainTab === "gesprek"
                    ? "bg-white text-athenaBlue shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Gespreksfiche
              </button>
              <button
                onClick={() => switchTab("volgsysteem")}
                className={`tab-btn px-4 md:px-6 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  mainTab === "volgsysteem"
                    ? "bg-white text-athenaBlue shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Feedcyclus
              </button>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-3 justify-end shrink-0">
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
