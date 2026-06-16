"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { isAllowedTeacherEmail } from "@/lib/school-domains";
import { showToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAllowedTeacherEmail(email)) {
      showToast(
        "Gebruik uw Athena-schoolmail: @athena-clw.be of @athena-heule.be",
        "error"
      );
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      showToast(
        error.message === "Invalid login credentials"
          ? "Onjuist e-mailadres of wachtwoord. Contacteer ICT als u nog geen account heeft."
          : error.message,
        "error"
      );
      setLoading(false);
      return;
    }

    const syncRes = await fetch("/api/auth/sync", { method: "POST" });
    const syncData = await syncRes.json();

    if (!syncRes.ok) {
      await supabase.auth.signOut();
      showToast(syncData.error || "Toegang geweigerd.", "error");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-athenaBg flex items-center justify-center px-4 md:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo_athena.png"
            alt="Athena Logo"
            width={160}
            height={60}
            className="h-14 w-auto object-contain mx-auto mb-4"
            priority
          />
          <h1 className="text-xl font-bold text-slate-800">Welkom terug</h1>
          <p className="text-sm text-slate-500 mt-1">
            Athena TOCI 2.0 — Gespreksfiche & Competentietracker
          </p>
          <span className="inline-block mt-2 bg-athenaPink/10 text-athenaPink text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            Duaal Leren Platform
          </span>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4"
        >
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed">
            Log in met uw <b>Athena-schoolmail</b>:
            <br />
            <span className="text-athenaBlue font-semibold">voornaam.naam@athena-clw.be</span>
            <br />
            <span className="text-athenaBlue font-semibold">voornaam.naam@athena-heule.be</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              E-mailadres
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue outline-none"
              placeholder="voornaam.naam@athena-clw.be"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-athenaBlue hover:bg-opacity-95 text-white font-bold text-sm py-3 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {loading ? "Inloggen..." : "Inloggen"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Geen account? Contacteer de ICT-coördinator van uw campus.
        </p>
      </div>
    </div>
  );
}
