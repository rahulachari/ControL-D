"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Droplet, Activity, Pill, Dumbbell, Moon, Utensils, Heart } from "lucide-react";
import { getWeeklyData, calculateHealthScore, dateKey, type DayData } from "@/lib/healthStore";

export default function AnalyticsPage() {
  const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
  const [period, setPeriod] = useState<"week" | "month">("week");

  useEffect(() => {
    setWeeklyData(getWeeklyData());
  }, []);

  const dayLabels = weeklyData.map((d) => new Date(d.date + "T12:00:00").toLocaleDateString([], { weekday: "short" }));

  // Computed metrics
  const waterData = weeklyData.map((d) => d.water.reduce((s, w) => s + w.amount, 0) / 1000);
  const sugarData = weeklyData.map((d) => d.sugar.length > 0 ? Math.round(d.sugar.reduce((s, r) => s + r.value, 0) / d.sugar.length) : 0);
  const exerciseData = weeklyData.map((d) => d.workouts.reduce((s, w) => s + w.duration, 0));
  const sleepData = weeklyData.map((d) => d.sleep?.hours || 0);
  const calData = weeklyData.map((d) => d.meals.reduce((s, m) => s + m.calories, 0));

  // Adherence calculations
  const medsAdherence = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((s, d) => {
        if (d.meds.length === 0) return s + 100;
        return s + (d.meds.filter((m) => m.status === "taken").length / d.meds.length) * 100;
      }, 0) / weeklyData.length)
    : 0;

  const waterAdherence = Math.round(weeklyData.filter((d) => d.goals.drinkWater).length / Math.max(weeklyData.length, 1) * 100);
  const exerciseAdherence = Math.round(weeklyData.filter((d) => d.goals.exercise).length / Math.max(weeklyData.length, 1) * 100);
  const sugarLogging = Math.round(weeklyData.filter((d) => d.sugar.length > 0).length / Math.max(weeklyData.length, 1) * 100);

  const metrics = [
    { label: "Medicine Adherence", value: `${medsAdherence}%`, icon: Pill, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Hydration Goal Met", value: `${waterAdherence}%`, icon: Droplet, color: "text-sky-500", bg: "bg-sky-500/10" },
    { label: "Exercise Consistency", value: `${exerciseAdherence}%`, icon: Dumbbell, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Sugar Logging", value: `${sugarLogging}%`, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  function BarChartSimple({ data, labels, color, unit, maxVal }: { data: number[]; labels: string[]; color: string; unit: string; maxVal?: number }) {
    const max = maxVal || Math.max(...data, 1);
    return (
      <div className="flex items-end gap-1.5 sm:gap-2 h-28">
        {data.map((val, i) => {
          const pct = max > 0 ? (val / max) * 100 : 0;
          const isToday = i === data.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-[8px] text-zinc-400 font-extrabold truncate max-w-full">{val > 0 ? `${val}${unit}` : "—"}</span>
              <div className="w-full bg-[#121421] rounded-lg overflow-hidden border border-[#727578]/30" style={{ height: "70px" }}>
                <div className={`w-full rounded-lg transition-all duration-500 ${color}`}
                  style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }} />
              </div>
              <span className={`text-[9px] font-bold ${isToday ? "text-[#194793]" : "text-zinc-400"} truncate max-w-full`}>{labels[i]}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-28 sm:pb-12">
      <div>
        <h1 className="text-3xl font-heading font-black text-[#194793] tracking-tight [text-shadow:2px_2px_0px_#121421] flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-[#194793]" /> Health Analytics
        </h1>
        <p className="text-zinc-300 text-sm mt-1">Weekly overview of your health metrics and adherence trends.</p>
      </div>

      {/* Adherence Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] backdrop-blur-xl border border-[#727578]/30 rounded-2xl p-4 sm:p-5 shadow-md text-center">
              <div className={`w-10 h-10 rounded-xl bg-[#194793] text-white flex items-center justify-center mx-auto mb-2 shadow-md`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className={`text-2xl font-heading font-black text-[#194793] [text-shadow:1.5px_1.5px_0px_#121421]`}>{m.value}</div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mt-0.5">{m.label}</span>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] backdrop-blur-xl border border-[#727578]/30 rounded-3xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#194793]" />
            <h3 className="text-sm font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">Blood Sugar (Avg mg/dL)</h3>
          </div>
          <BarChartSimple data={sugarData} labels={dayLabels} color="bg-[#194793]" unit="" maxVal={200} />
        </div>

        <div className="bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] backdrop-blur-xl border border-[#727578]/30 rounded-3xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Droplet className="w-5 h-5 text-[#194793]" />
            <h3 className="text-sm font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">Water Intake (L)</h3>
          </div>
          <BarChartSimple data={waterData.map((v) => parseFloat(v.toFixed(1)))} labels={dayLabels} color="bg-[#194793]" unit="L" maxVal={4} />
        </div>

        <div className="bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] backdrop-blur-xl border border-[#727578]/30 rounded-3xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-5 h-5 text-[#194793]" />
            <h3 className="text-sm font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">Exercise (min)</h3>
          </div>
          <BarChartSimple data={exerciseData} labels={dayLabels} color="bg-[#194793]" unit="m" maxVal={60} />
        </div>

        <div className="bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] backdrop-blur-xl border border-[#727578]/30 rounded-3xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-[#194793]" />
            <h3 className="text-sm font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">Sleep (hours)</h3>
          </div>
          <BarChartSimple data={sleepData} labels={dayLabels} color="bg-[#194793]" unit="h" maxVal={10} />
        </div>
      </div>

      {/* Calorie Chart */}
      <div className="bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] backdrop-blur-xl border border-[#727578]/30 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="w-5 h-5 text-[#194793]" />
          <h3 className="text-sm font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">Calorie Intake (kcal)</h3>
        </div>
        <BarChartSimple data={calData} labels={dayLabels} color="bg-[#194793]" unit="" maxVal={2500} />
      </div>
    </div>
  );
}
