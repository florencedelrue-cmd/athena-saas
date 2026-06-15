"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/Toast";

export default function SignupPage() {
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast("Wachtwoorden komen niet overeen.", "error");
      return;
    }

    if (password.length < 8) {
      showToast("Wachtwoord moet minimaal 8 tekens bevatten.", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Registratie mislukt.", "error");
        setLoading(false);
        return;
      }

      showToast("Account aangemaakt! U wordt doorgestuurd...", "success");

      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        showToast("Account aangemaakt. Log nu in.", "info");
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      showToast("Er is een fout opgetreden.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-athenaBg flex items-center justify-center px-4 md:px-8 py-8">
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
          <h1 className="text-xl font-bold text-slate-800">Registreer uw school</h1>
          <p className="text-sm text-slate-500 mt-1">
            Start met Athena Duaal Leren voor uw onderwijsinstelling
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Naam van de school
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue outline-none"
              placeholder="Bijv. GO! Atheneum Gent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              E-mailadres (beheerder)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue outline-none"
              placeholder="naam@school.be"
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
              minLength={8}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue outline-none"
              placeholder="Minimaal 8 tekens"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Bevestig wachtwoord
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-athenaBlue hover:bg-opacity-95 text-white font-bold text-sm py-3 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {loading ? "Account aanmaken..." : "Account aanmaken"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Al een account?{" "}
          <Link href="/login" className="text-athenaBlue font-bold hover:underline">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
