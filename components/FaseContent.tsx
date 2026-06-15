"use client";

import { useApp } from "@/context/AppContext";
import { ScreeningCard } from "@/components/fases/ScreeningCard";
import { AnalyseCard } from "@/components/fases/AnalyseCard";
import { CompetentiemeterCard } from "@/components/fases/CompetentiemeterCard";
import { UitvoeringCard } from "@/components/fases/UitvoeringCard";
import { DoorstroomCard } from "@/components/fases/DoorstroomCard";

export function FaseContent() {
  const { activeStudent } = useApp();
  const step = activeStudent?.process_step ?? 1;

  return (
    <div>
      {step === 1 && <ScreeningCard />}
      {step === 2 && <AnalyseCard />}
      {step === 3 && <CompetentiemeterCard />}
      {step === 4 && <UitvoeringCard />}
      {step === 5 && <DoorstroomCard />}
    </div>
  );
}
