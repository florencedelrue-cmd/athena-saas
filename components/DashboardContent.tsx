"use client";

import { useApp } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { PresentationBanner } from "@/components/PresentationBanner";
import { StudentBar } from "@/components/StudentBar";
import { AdminMetadata } from "@/components/AdminMetadata";
import { ProcessStepper } from "@/components/ProcessStepper";
import { FaseContent } from "@/components/FaseContent";
import { CyclusChart } from "@/components/tracker/CyclusChart";
import { IopTrackerList } from "@/components/tracker/IopTrackerList";
import { FrequencyTracker } from "@/components/tracker/FrequencyTracker";
import { LoadingState } from "@/components/ui/Loading";
import { PlannerTab } from "@/components/planner/PlannerTab";

export function DashboardContent() {
  const { mainTab, loading, activeStudent } = useApp();

  if (loading && !activeStudent) {
    return <LoadingState message="Leerlingdossiers laden..." />;
  }

  return (
    <div className="flex flex-col min-h-screen text-slate-800 antialiased">
      <PresentationBanner />
      <Header />
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6 px-4 md:px-8">
        {mainTab !== "planner" && <StudentBar />}

        {mainTab === "gesprek" && (
          <div className="space-y-6">
            <AdminMetadata />
            <ProcessStepper />
            <FaseContent />
          </div>
        )}

        {mainTab === "volgsysteem" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CyclusChart />
              <IopTrackerList />
            </div>
            <FrequencyTracker />
          </div>
        )}

        {mainTab === "planner" && <PlannerTab />}
      </main>
    </div>
  );
}
