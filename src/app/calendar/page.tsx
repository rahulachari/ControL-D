"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Activity, Droplet, Pill, Dumbbell, Moon, Utensils } from "lucide-react";
import { getDayData, dateKey, type DayData } from "@/lib/healthStore";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<DayData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleDateString([], { month: "long", year: "numeric" });

  // Pre-load month data for color coding
  const monthData = useMemo(() => {
    const data: Record<string, { score: number; logged: boolean }> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      const key = dateKey(dt);
      const day = getDayData(key);
      const hasData = day.sugar.length > 0 || day.water.length > 0 || day.meals.length > 0 || day.workouts.length > 0;
      const goals = Object.values(day.goals).filter(Boolean).length;
      data[key] = { score: goals, logged: hasData };
    }
    return data;
  }, [year, month, daysInMonth]);

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  const handleSelectDate = (d: number) => {
    const dt = new Date(year, month, d);
    const key = dateKey(dt);
    setSelectedDate(key);
    setSelectedData(getDayData(key));
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const todayStr = dateKey(new Date());
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <CalIcon className="w-7 h-7 text-teal-500" /> Health Calendar
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Tap any day to view your health summary.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-7 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">{monthName}</h3>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[10px] font-bold uppercase text-slate-400 py-1">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => <div key={`b-${i}`} />)}
            {days.map((d) => {
              const dt = new Date(year, month, d);
              const key = dateKey(dt);
              const info = monthData[key];
              const isToday = key === todayStr;
              const isSelected = key === selectedDate;
              const isFuture = dt > new Date();

              let dotColor = "";
              if (info?.logged) {
                if (info.score >= 5) dotColor = "bg-emerald-500";
                else if (info.score >= 3) dotColor = "bg-blue-500";
                else if (info.score >= 1) dotColor = "bg-amber-500";
                else dotColor = "bg-slate-300";
              }

              return (
                <button
                  key={d}
                  onClick={() => handleSelectDate(d)}
                  disabled={isFuture}
                  className={`relative w-full aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all ${
                    isSelected ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" :
                    isToday ? "bg-blue-500/10 text-blue-500 border border-blue-500/30" :
                    isFuture ? "text-slate-300 cursor-not-allowed" :
                    "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {d}
                  {dotColor && !isSelected && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-500 justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Great (5+ goals)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Good (3-4)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Some (1-2)</span>
          </div>
        </div>

        {/* Day Detail */}
        <div className="lg:col-span-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
          {selectedData ? (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">
                {new Date(selectedData.date + "T12:00:00").toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
              </h3>

              {/* Sugar */}
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-500">Blood Sugar</span>
                </div>
                {selectedData.sugar.length > 0 ? (
                  <div className="space-y-1">
                    {selectedData.sugar.map((r) => (
                      <div key={r.id} className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>{r.value} mg/dL ({r.context.replace(/_/g, " ")})</span>
                        <span>{new Date(r.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-400">No readings</p>}
              </div>

              {/* Water */}
              <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <Droplet className="w-4 h-4 text-sky-500" />
                  <span className="text-xs font-bold text-sky-500">Water</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {(selectedData.water.reduce((s, w) => s + w.amount, 0) / 1000).toFixed(1)}L
                </span>
              </div>

              {/* Meals */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-500">Meals ({selectedData.meals.length})</span>
                </div>
                {selectedData.meals.length > 0 ? (
                  <div className="space-y-1">
                    {selectedData.meals.map((m) => (
                      <div key={m.id} className="text-xs text-slate-600 dark:text-slate-400">{m.name} — {m.calories} kcal</div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-400">No meals logged</p>}
              </div>

              {/* Exercise */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-500">Exercise</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedData.workouts.reduce((s, w) => s + w.duration, 0)} min
                </span>
              </div>

              {/* Sleep */}
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-indigo-500">Sleep</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedData.sleep ? `${selectedData.sleep.hours}h (${selectedData.sleep.quality}/5)` : "Not logged"}
                </span>
              </div>

              {/* Meds */}
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <Pill className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-rose-500">Medication</span>
                </div>
                {selectedData.meds.length > 0 ? (
                  <div className="space-y-1">
                    {selectedData.meds.map((m) => (
                      <div key={m.id} className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>{m.name}</span>
                        <span className={m.status === "taken" ? "text-emerald-500" : m.status === "missed" ? "text-rose-500" : "text-slate-400"}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-400">No medicines</p>}
              </div>

              {/* Mood */}
              {selectedData.mood && (
                <div className="text-xs text-slate-500 text-center pt-2">
                  Mood: {selectedData.mood.mood === "happy" ? "😊" : selectedData.mood.mood === "normal" ? "😐" : selectedData.mood.mood === "tired" ? "😴" : selectedData.mood.mood === "anxious" ? "😰" : selectedData.mood.mood === "stressed" ? "😣" : "😢"} {selectedData.mood.mood}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <CalIcon className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-sm text-slate-400">Select a date to view your health summary</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
