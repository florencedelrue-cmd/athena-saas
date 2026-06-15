"use client";

import { UserCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useCallback, useEffect, useState } from "react";

export function AdminMetadata() {
  const { activeStudent, updateStudent } = useApp();
  const [name, setName] = useState("");
  const [coach, setCoach] = useState("");
  const [klass, setKlass] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (activeStudent) {
      setName(activeStudent.name);
      setCoach(activeStudent.coach);
      setKlass(activeStudent.class);
      setYear(activeStudent.school_year);
    }
  }, [activeStudent]);

  const handleChange = useCallback(
    (field: "name" | "coach" | "class" | "school_year", value: string) => {
      if (field === "name") setName(value);
      if (field === "coach") setCoach(value);
      if (field === "class") setKlass(value);
      if (field === "school_year") setYear(value);
    },
    []
  );

  const handleBlur = useCallback(
    (field: "name" | "coach" | "class" | "school_year", value: string) => {
      if (!activeStudent) return;
      const updates: Record<string, string> = {};
      if (field === "name" && value !== activeStudent.name) updates.name = value;
      if (field === "coach" && value !== activeStudent.coach) updates.coach = value;
      if (field === "class" && value !== activeStudent.class) updates.class = value;
      if (field === "school_year" && value !== activeStudent.school_year)
        updates.school_year = value;
      if (Object.keys(updates).length > 0) {
        updateStudent(updates);
      }
    },
    [activeStudent, updateStudent]
  );

  if (!activeStudent) return null;

  return (
    <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <UserCheck className="w-4 h-4 text-athenaBlue" />
        <span>Administratieve Gegevens</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Naam Leerling
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={(e) => handleBlur("name", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 md:py-2 text-sm text-slate-800 focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Trajectbegeleider / Coach
          </label>
          <input
            type="text"
            value={coach}
            onChange={(e) => handleChange("coach", e.target.value)}
            onBlur={(e) => handleBlur("coach", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 md:py-2 text-sm text-slate-800 focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Klasgroep
          </label>
          <input
            type="text"
            value={klass}
            onChange={(e) => handleChange("class", e.target.value)}
            onBlur={(e) => handleBlur("class", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 md:py-2 text-sm text-slate-800 focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Schooljaar
          </label>
          <input
            type="text"
            value={year}
            onChange={(e) => handleChange("school_year", e.target.value)}
            onBlur={(e) => handleBlur("school_year", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 md:py-2 text-sm text-slate-800 focus:border-athenaBlue focus:ring-1 focus:ring-athenaBlue outline-none"
          />
        </div>
      </div>
    </div>
  );
}
