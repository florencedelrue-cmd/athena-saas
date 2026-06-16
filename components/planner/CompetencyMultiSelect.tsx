"use client";

import { COMPETENCIES_DATA } from "@/lib/constants";
import type { CompetencyDomainKey } from "@/types";

interface CompetencyMultiSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxHeight?: string;
}

export function CompetencyMultiSelect({
  selectedIds,
  onChange,
  maxHeight = "max-h-48",
}: CompetencyMultiSelectProps) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((c) => c !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-1">
      <p className="text-[10px] text-slate-400 font-semibold mb-1">
        {selectedIds.length} competentie(s) gekoppeld
      </p>
      <div
        className={`space-y-1 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50 ${maxHeight}`}
      >
        {(Object.keys(COMPETENCIES_DATA) as CompetencyDomainKey[]).map((domainKey) => (
          <div key={domainKey}>
            <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wide pt-2 pb-1">
              {COMPETENCIES_DATA[domainKey].title}
            </div>
            {COMPETENCIES_DATA[domainKey].items.map((item) => (
              <label
                key={item.id}
                className="flex items-center space-x-2 text-[11px] p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggle(item.id)}
                  className="rounded text-athenaGreen focus:ring-athenaGreen w-3.5 h-3.5"
                />
                <span className="text-slate-700">
                  <span className="font-bold">{item.id.toUpperCase()}:</span>{" "}
                  {item.title.split(": ")[1]}
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompetencyBadges({ competencyIds }: { competencyIds: string[] }) {
  if (competencyIds.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {competencyIds.map((id) => (
        <span
          key={id}
          className="bg-athenaGreen/10 text-athenaGreen font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase"
        >
          {id}
        </span>
      ))}
    </div>
  );
}
