"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { showToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showToast(error.message, "error");
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
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              E-mailadres
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

        <p className="text-center text-xs text-slate-500 mt-6">
          Nog geen account?{" "}
          <Link href="/signup" className="text-athenaBlue font-bold hover:underline">
            Registreer uw school
          </Link>
        </p>
      </div>
    </div>
  );
}
