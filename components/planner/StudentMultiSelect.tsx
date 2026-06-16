"use client";

import { useApp } from "@/context/AppContext";

interface StudentMultiSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxHeight?: string;
}

export function StudentMultiSelect({
  selectedIds,
  onChange,
  maxHeight = "max-h-40",
}: StudentMultiSelectProps) {
  const { students } = useApp();

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectAll = () => onChange(students.map((s) => s.id));
  const clearAll = () => onChange([]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 text-[10px]">
        <button
          type="button"
          onClick={selectAll}
          className="text-athenaBlue font-bold hover:underline"
        >
          Alles selecteren
        </button>
        <span className="text-slate-300">|</span>
        <button
          type="button"
          onClick={clearAll}
          className="text-slate-500 font-bold hover:underline"
        >
          Wissen
        </button>
        <span className="ml-auto text-slate-400 font-semibold">
          {selectedIds.length} geselecteerd
        </span>
      </div>
      <div
        className={`space-y-1 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50 ${maxHeight}`}
      >
        {students.map((student) => (
          <label
            key={student.id}
            className="flex items-center space-x-2 text-xs p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(student.id)}
              onChange={() => toggle(student.id)}
              className="rounded text-athenaBlue focus:ring-athenaBlue w-4 h-4"
            />
            <span className="text-slate-700 font-medium">{student.name}</span>
            <span className="text-slate-400 text-[10px]">{student.class}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function StudentBadges({ studentIds }: { studentIds: string[] }) {
  const { students } = useApp();
  if (studentIds.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {studentIds.map((id) => {
        const student = students.find((s) => s.id === id);
        return (
          <span
            key={id}
            className="bg-athenaBlue/10 text-athenaBlue font-bold text-[9px] px-2 py-0.5 rounded-full"
          >
            {student?.name || "Onbekend"}
          </span>
        );
      })}
    </div>
  );
}
