"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

export function PresentationBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-athenaBlue to-[#1a6bb5] text-white px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Sparkles className="w-5 h-5 flex-shrink-0 text-athenaPink" />
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">
              Athena TOCI 2.0 — Duaal Leren Platform
            </p>
            <p className="text-[11px] text-white/80 hidden sm:block">
              Demo — direct toegang, geen login · Senne Devos & Lisa Peeters
            </p>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="p-2 hover:bg-white/10 rounded-lg transition flex-shrink-0"
          aria-label="Sluiten"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
