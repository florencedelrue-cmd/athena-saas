"use client";

import { useState } from "react";
import { BookOpen, History, PlusCircle, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { COMPETENCIES_DATA } from "@/lib/constants";
import { showToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/Loading";
import type { CompetencyDomainKey } from "@/types";

export function UitvoeringCard() {
  const { activeStudent, getAnalyse, addLog, deleteLog } = useApp();
  const [logDate, setLogDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [logSubject, setLogSubject] = useState("");
  const [logReport, setLogReport] = useState("");
  const [selectedComps, setSelectedComps] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const iopFocus = getAnalyse().iopFocus;
  const focusSet = new Set(iopFocus);
  const logs = activeStudent?.logs ?? [];

  const toggleComp = (compId: string) => {
    setSelectedComps((prev) =>
      prev.includes(compId) ? prev.filter((c) => c !== compId) : [...prev, compId]
    );
  };

  const handleSave = async () => {
    if (!logDate || !logSubject.trim() || !logReport.trim()) {
      showToast(
        "Gelieve alle verplichte velden in te vullen (Datum, Onderwerp en Verslag).",
        "error"
      );
      return;
    }
    setSaving(true);
    try {
      await addLog({
        date: logDate,
        title: logSubject.trim(),
        content: logReport.trim(),
        competenciesUsed: selectedComps,
      });
      setLogSubject("");
      setLogReport("");
      setSelectedComps([]);
      setLogDate(new Date().toISOString().split("T")[0]);
      showToast("Nota opgeslagen.", "success");
    } catch {
      showToast("Fout bij opslaan nota.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (confirm("Weet u zeker dat u deze logboeknota permanent wilt verwijderen?")) {
      await deleteLog(logId);
      showToast("Nota verwijderd.", "success");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 md:col-span-1">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-4.5 h-4.5 text-athenaBlue" />
          <span>Lesverslag of Werkpleknota</span>
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Datum
            </label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 md:py-2 text-sm text-slate-800 focus:border-athenaBlue outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Lesonderwerp / Werkplekactiviteit
            </label>
            <input
              type="text"
              value={logSubject}
              onChange={(e) => setLogSubject(e.target.value)}
              placeholder="Bijv. Installatietechniek project 1..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 md:py-2 text-sm text-slate-800 focus:border-athenaBlue outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Gewerkt aan competenties:
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50">
              {(Object.keys(COMPETENCIES_DATA) as CompetencyDomainKey[]).map(
                (domainKey) =>
                  COMPETENCIES_DATA[domainKey].items.map((item) => {
                    const isFocus = focusSet.has(item.id);
                    return (
                      <label
                        key={item.id}
                        className="flex items-center space-x-2 text-[11px] p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedComps.includes(item.id)}
                          onChange={() => toggleComp(item.id)}
                          className="rounded text-athenaGreen focus:ring-athenaGreen w-3.5 h-3.5"
                        />
                        <span
                          className={`text-slate-700 ${isFocus ? "font-bold" : ""}`}
                        >
                          {item.id.toUpperCase()}: {item.title.split(": ")[1]}{" "}
                          {isFocus ? "⭐" : ""}
                        </span>
                      </label>
                    );
                  })
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Verslag / Feedback
            </label>
            <textarea
              value={logReport}
              onChange={(e) => setLogReport(e.target.value)}
              rows={4}
              placeholder="Omschrijf de vorderingen, houding of specifieke werkpunten tijdens deze les..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-athenaBlue"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-athenaBlue hover:bg-opacity-95 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm sticky bottom-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{saving ? "Opslaan..." : "Nota Opslaan"}</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 md:col-span-2 flex flex-col">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b">
          <History className="w-4.5 h-4.5 text-athenaGreen" />
          <span>Logboek overzicht van deze leerling</span>
        </h3>
        <div className="space-y-3 flex-grow overflow-y-auto max-h-[500px]">
          {logs.length === 0 ? (
            <EmptyState message="Er zijn nog geen logboeknota's geregistreerd voor deze leerling." />
          ) : (
            [...logs].map((log) => (
              <div
                key={log.id}
                className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 space-y-2 relative group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      {log.date}
                    </span>
                    <h4 className="font-bold text-slate-800 text-xs mt-0.5">
                      {log.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="text-slate-300 hover:text-red-500 transition lg:opacity-0 group-hover:opacity-100 p-2 md:p-1"
                    title="Verwijder nota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{log.content}</p>
                {log.competencies_used && log.competencies_used.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase py-0.5">
                      Gewerkt aan:
                    </span>
                    {log.competencies_used.map((compId) => (
                      <span
                        key={compId}
                        className="bg-athenaGreen/10 text-athenaGreen font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase"
                      >
                        {compId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
