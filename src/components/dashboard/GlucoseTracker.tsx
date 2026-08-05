"use client";

import { useState, useEffect, useMemo } from "react";
import { Activity, Plus, TrendingUp, TrendingDown, Minus, Brain, BarChart3, Clock, AlertTriangle } from "lucide-react";
import { addSugarReading, getDayData, getWeeklyData, getSugarStatus, type SugarReading } from "@/lib/healthStore";
import BorderGlow from "@/components/ui/BorderGlow";

const MONO_GLOW = {
  backgroundColor: "#09090b",
  glowColor: "0 0 100",
  colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
  borderRadius: 24,
};

const CONTEXTS = [
  { value: "before_breakfast", label: "Before Breakfast", icon: "🌅" },
  { value: "after_breakfast", label: "After Breakfast", icon: "🍳" },
  { value: "before_lunch", label: "Before Lunch", icon: "☀️" },
  { value: "after_lunch", label: "After Lunch", icon: "🍚" },
  { value: "before_dinner", label: "Before Dinner", icon: "🌆" },
  { value: "after_dinner", label: "After Dinner", icon: "🌙" },
  { value: "bedtime", label: "Bedtime", icon: "😴" },
  { value: "random", label: "Random", icon: "🔀" },
];

export default function GlucoseTracker() {
  const [reading, setReading] = useState("");
  const [context, setContext] = useState("fasting");
  const [notes, setNotes] = useState("");
  const [readings, setReadings] = useState<SugarReading[]>([]);
  const [chartPeriod, setChartPeriod] = useState<"today" | "week">("today");
  const [showInsights, setShowInsights] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const day = getDayData();
    setReadings(day.sugar);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reading) return;
    const val = parseInt(reading);
    if (isNaN(val) || val < 20 || val > 600) return;

    const day = addSugarReading({
      value: val,
      context,
      time: new Date().toISOString(),
      notes: notes || undefined,
    });
    setReadings(day.sugar);
    setReading("");
    setNotes("");
  };

  // Weekly data for chart
  const weeklyReadings = useMemo(() => {
    if (!mounted) return [];
    const week = getWeeklyData();
    return week.map((d) => ({
      date: d.date,
      readings: d.sugar,
      avg: d.sugar.length > 0 ? Math.round(d.sugar.reduce((s, r) => s + r.value, 0) / d.sugar.length) : null,
    }));
  }, [readings, mounted]);

  // Stats
  const allVals = readings.map((r) => r.value);
  const avg = allVals.length > 0 ? Math.round(allVals.reduce((s, v) => s + v, 0) / allVals.length) : 0;
  const highest = allVals.length > 0 ? Math.max(...allVals) : 0;
  const lowest = allVals.length > 0 ? Math.min(...allVals) : 0;
  const inRange = allVals.filter((v) => v >= 70 && v <= 180).length;
  const inRangePct = allVals.length > 0 ? Math.round((inRange / allVals.length) * 100) : 0;

  // HbA1c estimate
  const weeklyAvgs = weeklyReadings.filter((w) => w.avg !== null).map((w) => w.avg!);
  const overallAvg = weeklyAvgs.length > 0 ? weeklyAvgs.reduce((s, v) => s + v, 0) / weeklyAvgs.length : avg;
  const hba1c = overallAvg > 0 ? ((overallAvg + 46.7) / 28.7).toFixed(1) : "—";

  // AI Insights
  const insights: string[] = [];
  if (readings.length >= 2) {
    const afterMealReadings = readings.filter((r) => r.context.startsWith("after_"));
    const beforeMealReadings = readings.filter((r) => r.context.startsWith("before_"));
    if (afterMealReadings.length > 0 && beforeMealReadings.length > 0) {
      const afterAvg = afterMealReadings.reduce((s, r) => s + r.value, 0) / afterMealReadings.length;
      const beforeAvg = beforeMealReadings.reduce((s, r) => s + r.value, 0) / beforeMealReadings.length;
      const spike = Math.round(afterAvg - beforeAvg);
      if (spike > 40) insights.push(`Your post-meal spike averages ${spike} mg/dL. Walking 15 min after eating can reduce this by ~20%.`);
    }
  }
  if (highest > 200) insights.push(`Your highest reading today was ${highest} mg/dL. Consider reviewing your last meal's carb content.`);
  if (lowest > 0 && lowest < 70) insights.push(`Low sugar alert: ${lowest} mg/dL detected. Keep glucose tablets handy.`);
  if (avg > 0 && avg <= 140) insights.push("Your average sugar is within the normal range. Great control!");
  if (insights.length === 0 && readings.length > 0) insights.push("Keep logging consistently. More data helps identify patterns and improve predictions.");

  // Chart data
  const chartData = chartPeriod === "today"
    ? readings.map((r) => ({ label: new Date(r.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), value: r.value }))
    : weeklyReadings.map((w) => ({ label: new Date(w.date + "T12:00:00").toLocaleDateString([], { weekday: "short" }), value: w.avg || 0 }));

  const chartMax = chartData.length > 0 ? Math.max(...chartData.map((d) => d.value), 200) : 200;

  return (
    <div className="space-y-6" suppressHydrationWarning>

      {/* ===== Page Header ===== */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-heading font-black text-white tracking-tight">Glucose Tracking</h1>
        <p className="text-sm text-zinc-400 font-medium">Log and monitor your blood sugar readings with clinical precision.</p>
      </div>

      {/* ===== Stats Row ===== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" suppressHydrationWarning>
        {[
          { label: "Average", value: mounted && avg > 0 ? `${avg}` : "—", unit: "mg/dL" },
          { label: "Highest", value: mounted && highest > 0 ? `${highest}` : "—", unit: "mg/dL" },
          { label: "Lowest", value: mounted && lowest > 0 ? `${lowest}` : "—", unit: "mg/dL" },
          { label: "In Range", value: mounted ? `${inRangePct}%` : "0%", unit: "70-180" },
          { label: "Est. HbA1c", value: mounted ? hba1c : "—", unit: "%" },
        ].map((stat, i) => (
          <BorderGlow key={i} {...MONO_GLOW} className="w-full">
            <div className="p-5 text-center" suppressHydrationWarning>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{stat.label}</span>
              <div className="text-3xl font-heading font-black text-white mt-1" suppressHydrationWarning>{stat.value}</div>
              <span className="text-[10px] text-zinc-500 font-semibold">{stat.unit}</span>
            </div>
          </BorderGlow>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6" suppressHydrationWarning>

        {/* ===== Add Reading Form ===== */}
        <div className="lg:col-span-4">
          <BorderGlow {...MONO_GLOW} className="w-full h-full">
            <div className="p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-2xl bg-white text-black flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-heading font-extrabold text-white">Add Reading</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={reading}
                    onChange={(e) => setReading(e.target.value)}
                    placeholder="e.g. 120"
                    required
                    min={20} max={600}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none text-xl font-bold text-white placeholder-zinc-500 focus:border-white transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-2 block">Context</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONTEXTS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setContext(c.value)}
                        className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
                          context === c.value
                            ? "bg-white border-white text-black shadow-lg shadow-white/20"
                            : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span>{c.icon}</span>
                        <span className="truncate">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">Notes (optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. After heavy meal"
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none text-sm text-white placeholder-zinc-500 focus:border-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-white text-black font-black text-sm shadow-lg shadow-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Save Reading
                </button>
              </form>
            </div>
          </BorderGlow>
        </div>

        {/* ===== Chart + History ===== */}
        <div className="lg:col-span-8 space-y-6">

          {/* Chart */}
          <BorderGlow {...MONO_GLOW} className="w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-white text-black flex items-center justify-center font-bold">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-heading font-extrabold text-white">Glucose Trends</h3>
                </div>
                <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-full border border-zinc-800">
                  {(["today", "week"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        chartPeriod === p
                          ? "bg-white text-black shadow-md"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {p === "today" ? "Today" : "This Week"}
                    </button>
                  ))}
                </div>
              </div>

              {mounted && chartData.length > 0 ? (
                <div className="flex items-end gap-3 h-44 pt-4">
                  {chartData.map((d, i) => {
                    const barPct = chartMax > 0 ? (d.value / chartMax) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-extrabold text-zinc-300">{d.value > 0 ? d.value : ""}</span>
                        <div className="w-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800" style={{ height: "110px" }}>
                          <div
                            className="w-full bg-white rounded-2xl transition-all duration-500 shadow-lg shadow-white/20"
                            style={{ height: `${barPct}%`, marginTop: `${100 - barPct}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-zinc-400 font-bold truncate max-w-full">{d.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-zinc-400 text-center py-10">No readings to chart yet. Add your first reading!</p>
              )}
            </div>
          </BorderGlow>

          {/* AI Insights */}
          {showInsights && insights.length > 0 && (
            <BorderGlow {...MONO_GLOW} className="w-full">
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-white" />
                  <h3 className="text-sm font-heading font-extrabold text-white">AI Clinical Insights</h3>
                </div>
                {insights.map((tip, i) => (
                  <p key={i} className="text-sm text-zinc-200 pl-7 leading-relaxed font-medium">• {tip}</p>
                ))}
              </div>
            </BorderGlow>
          )}

          {/* History */}
          <BorderGlow {...MONO_GLOW} className="w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-white text-black flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-heading font-extrabold text-white">Today's Readings</h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                  {mounted ? readings.length : 0} entries
                </span>
              </div>

              {!mounted || readings.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-6">No readings logged today.</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {[...readings].reverse().map((r) => {
                    const status = getSugarStatus(r.value);
                    return (
                      <div key={r.id} className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-heading font-extrabold text-white">{r.value}</span>
                          <span className="text-xs font-bold text-zinc-400">mg/dL</span>
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full border bg-zinc-800 border-zinc-700 text-white">
                            {status.emoji} {status.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-zinc-300">
                            {new Date(r.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-semibold capitalize">{r.context.replace(/_/g, " ")}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </BorderGlow>
        </div>
      </div>
    </div>
  );
}
