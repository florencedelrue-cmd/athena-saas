"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AthenaLogo } from "@/components/AthenaLogo";
import { showToast } from "@/components/ui/Toast";

function LoginForm() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      showToast(decodeURIComponent(error), "error");
    }
  }, [searchParams]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs">
      <p className="text-sm text-slate-600 leading-relaxed text-center">
        Toegang tot het platform verloopt via uw beheerder.
        <br />
        <span className="text-slate-400 text-xs mt-2 block">
          Neem contact op met ICT als u geen toegangslink heeft ontvangen.
        </span>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-athenaBg flex items-center justify-center px-4 md:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <AthenaLogo className="h-14 w-auto object-contain mx-auto mb-4" width={160} height={60} priority />
          <h1 className="text-xl font-bold text-slate-800">Athena TOCI 2.0</h1>
          <p className="text-sm text-slate-500 mt-1">Gespreksfiche & Competentietracker</p>
          <span className="inline-block mt-2 bg-athenaPink/10 text-athenaPink text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            Duaal Leren Platform
          </span>
        </div>

        <Suspense
          fallback={
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs text-center text-sm text-slate-500">
              Laden...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
