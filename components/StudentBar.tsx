"use client";

import { useState } from "react";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { showToast } from "@/components/ui/Toast";

export function StudentBar() {
  const {
    students,
    activeStudentId,
    switchStudent,
    createStudent,
    deleteStudent,
  } = useApp();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    const name = prompt("Voer de volledige naam in van de nieuwe leerling:");
    if (!name || name.trim() === "") return;

    const cleanName = name.trim();
    if (students.some((s) => s.name === cleanName)) {
      showToast("Er bestaat al een leerlingdossier met deze naam.", "error");
      return;
    }

    setCreating(true);
    try {
      await createStudent(cleanName);
      showToast(`Dossier voor ${cleanName} aangemaakt.`, "success");
    } catch {
      showToast("Fout bij aanmaken dossier.", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (students.length <= 1) {
      showToast("Er moet minimaal één leerlingdossier bewaard blijven.", "error");
      return;
    }
    const active = students.find((s) => s.id === activeStudentId);
    if (!active) return;
    if (
      confirm(
        `Weet u zeker dat u het dossier van ${active.name} definitief wilt verwijderen?`
      )
    ) {
      await deleteStudent();
      showToast("Dossier verwijderd.", "success");
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="bg-athenaBlue/10 p-2.5 rounded-xl text-athenaBlue">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Actief Leerlingdossier
          </label>
          <select
            value={activeStudentId || ""}
            onChange={(e) => switchStudent(e.target.value)}
            className="bg-transparent border-none text-sm font-bold text-slate-800 focus:ring-0 outline-none p-0 cursor-pointer py-1"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleCreate}
          disabled={creating}
          className="bg-athenaBlue/10 hover:bg-athenaBlue/20 text-athenaBlue font-bold text-xs px-4 py-3 md:py-2 rounded-xl transition flex items-center space-x-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>{creating ? "Bezig..." : "Nieuw Dossier"}</span>
        </button>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:bg-red-50 p-3 md:p-2 rounded-xl transition"
          title="Verwijder dit dossier"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}
