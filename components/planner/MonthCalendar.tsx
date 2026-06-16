"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getCalendarDays,
  getMonthLabel,
  toDateKey,
  WEEKDAYS,
} from "@/lib/planner-utils";

interface MonthCalendarProps {
  year: number;
  month: number;
  selectedDate: string | null;
  eventDates: Set<string>;
  onSelectDate: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthCalendar({
  year,
  month,
  selectedDate,
  eventDates,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: MonthCalendarProps) {
  const days = getCalendarDays(year, month);
  const todayKey = toDateKey(new Date());

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm text-slate-800">
          {getMonthLabel(year, month)}
        </span>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-bold text-slate-400 uppercase py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((dateKey, idx) => {
          if (!dateKey) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const isSelected = selectedDate === dateKey;
          const isToday = dateKey === todayKey;
          const hasEvents = eventDates.has(dateKey);
          const dayNum = parseInt(dateKey.split("-")[2], 10);

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className={`aspect-square rounded-xl text-xs font-bold transition flex flex-col items-center justify-center relative ${
                isSelected
                  ? "bg-athenaBlue text-white shadow-sm"
                  : isToday
                  ? "bg-athenaBlue/10 text-athenaBlue border border-athenaBlue/30"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              {dayNum}
              {hasEvents && (
                <span
                  className={`absolute bottom-1 w-1 h-1 rounded-full ${
                    isSelected ? "bg-white" : "bg-athenaPink"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
