"use client";

import { useState, useEffect, useMemo } from "react";
import { Activity, Plus, TrendingUp, TrendingDown, Minus, Brain, BarChart3, Clock, AlertTriangle } from "lucide-react";
import { addSugarReading, getDayData, getWeeklyData, getSugarStatus, type SugarReading } from "@/lib/healthStore";
import BorderGlow from "@/components/ui/BorderGlow";

const OVERVIEW_GLOW = {
  backgroundColor: "#121421",
  glowColor: "215 71 34",
  colors: ["#194793", "#727578", "#121421"],
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
    return week.map((d) => {
      const vals = d.sugar.map((s) => s.value);
      const avgVal = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      return { date: d.date, avg: avgVal, count: vals.length };
    });
  }, [mounted, readings]);

  // Compute stats
  const values = readings.map((r) => r.value);
  const avg = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const highest = values.length > 0 ? Math.max(...values) : 0;
  const lowest = values.length > 0 ? Math.min(...values) : 0;
  const inRange = values.filter((v) => v >= 70 && v <= 180).length;
  const inRangePct = values.length > 0 ? Math.round((inRange / values.length) * 100) : 0;

  // Estimated HbA1c formula: (eAG + 46.7) / 28.7
  const hba1c = avg > 0 ? ((avg + 46.7) / 28.7).toFixed(1) : "—";

  // Dynamic Clinical Insights
  const insights = useMemo(() => {
    const tips: string[] = [];
    if (avg > 180) tips.push("Your average glucose is above target (180 mg/dL). Consider adjusting meal portions or consulting your doctor.");
    if (lowest > 0 && lowest < 70) tips.push("Hypoglycemia detected (< 70 mg/dL). Always keep quick-acting carbs like 15g glucose or fruit juice handy.");
    if (inRangePct >= 80) tips.push("Excellent work! You are staying in target range 80%+ of the time.");
    
    if (readings.length === 0) tips.push("Log your first reading today to unlock personalized clinical insights!");
    else if (tips.length === 0) tips.push("Great job! Your recent blood sugar readings are stable and within a healthy range.");
    
    return tips;
  }, [avg, lowest, inRangePct, readings.length]);

  const chartData = chartPeriod === "today"
    ? readings.map((r) => ({ label: new Date(r.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), value: r.value }))
    : weeklyReadings.map((w) => ({ label: new Date(w.date + "T12:00:00").toLocaleDateString([], { weekday: "short" }), value: w.avg || 0 }));

  const chartMax = chartData.length > 0 ? Math.max(...chartData.map((d) => d.value), 200) : 200;

  return (
    <div className="space-y-6" suppressHydrationWarning>

      {/* ===== Page Header ===== */}
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121421] border border-[#0ea5e9]/40 text-[#0ea5e9] text-xs font-black w-fit mb-1 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-[#0ea5e9]" /> Precision Blood Sugar Monitoring
        </div>
        <h1 className="text-3xl font-heading font-black text-[#194793] tracking-tight [text-shadow:2px_2px_0px_#121421]">Glucose Tracking</h1>
        <p className="text-sm text-zinc-300 font-medium">Log and monitor your blood sugar readings with clinical precision.</p>
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
          <BorderGlow key={i} {...OVERVIEW_GLOW} className={`w-full ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}>
            <div className="p-4 sm:p-5 text-center bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg" suppressHydrationWarning>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#194793] block">{stat.label}</span>
              <div className="text-2xl sm:text-3xl font-heading font-black text-[#194793] mt-1 [text-shadow:1.5px_1.5px_0px_#121421]" suppressHydrationWarning>{stat.value}</div>
              <span className="text-[9px] sm:text-[10px] text-zinc-400 font-semibold">{stat.unit}</span>
            </div>
          </BorderGlow>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6" suppressHydrationWarning>

        {/* ===== Add Reading Form ===== */}
        <div className="lg:col-span-4">
          <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-2xl bg-[#194793] text-white flex items-center justify-center font-bold shadow-md">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-heading font-extrabold text-[#194793] [text-shadow:1px_1px_0px_#121421]">Add Reading</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-black text-[#194793] mb-1.5 block uppercase tracking-wider">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={reading}
                    onChange={(e) => setReading(e.target.value)}
                    placeholder="e.g. 120"
                    required
                    min={20} max={600}
                    className="w-full px-4 py-3 rounded-2xl bg-[#121421] border border-[#727578]/40 outline-none text-xl font-bold text-white placeholder-zinc-500 focus:border-[#194793] focus:ring-1 focus:ring-[#194793] transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#194793] mb-2 block uppercase tracking-wider">Context</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONTEXTS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setContext(c.value)}
                        className={`p-2 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-1 sm:gap-2 border text-center sm:text-left ${
                          context === c.value
                            ? "bg-[#194793] border-[#194793] text-white shadow-lg shadow-[#121421]"
                            : "bg-[#121421] border-[#727578]/40 text-zinc-300 hover:bg-[#727578]/20 hover:text-white"
                        }`}
                      >
                        <span className="text-[14px] sm:text-base shrink-0">{c.icon}</span>
                        <span className="leading-tight min-w-0 break-words">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-[#194793] mb-1.5 block uppercase tracking-wider">Notes (optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. After heavy meal"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#121421] border border-[#727578]/40 outline-none text-sm text-white placeholder-zinc-500 focus:border-[#194793] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#194793] text-white font-black text-sm shadow-lg shadow-[#121421] hover:scale-[1.02] active:scale-[0.98] transition-all border border-[#727578]/40 uppercase tracking-wider"
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
          <BorderGlow {...OVERVIEW_GLOW} className="w-full min-w-0">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg min-w-0 w-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-[#194793] text-white flex items-center justify-center font-bold shadow-md">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-heading font-extrabold text-[#194793] [text-shadow:1px_1px_0px_#121421]">Glucose Trends</h3>
                </div>
                <div className="flex gap-1.5 bg-[#121421] p-1 rounded-full border border-[#727578]/40">
                  {(["today", "week"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        chartPeriod === p
                          ? "bg-[#194793] text-white shadow-md"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {p === "today" ? "Today" : "This Week"}
                    </button>
                  ))}
                </div>
              </div>

              {mounted && chartData.length > 0 ? (
                <div className="flex items-end gap-2.5 sm:gap-4 h-[220px] sm:h-44 pt-4 overflow-x-auto pb-4">
                  {chartData.map((d, i) => {
                    const barPct = chartMax > 0 ? (d.value / chartMax) * 100 : 0;
                    return (
                      <div key={i} className="min-w-[48px] sm:min-w-0 flex-1 flex flex-col items-center gap-1.5 sm:gap-2 shrink-0 sm:shrink">
                        <span className="text-[10px] font-extrabold text-[#194793]">{d.value > 0 ? d.value : ""}</span>
                        <div className="w-full max-w-[24px] sm:max-w-none bg-[#121421] rounded-2xl overflow-hidden border border-[#727578]/30" style={{ height: "120px" }}>
                          <div
                            className="w-full bg-[#194793] rounded-2xl transition-all duration-500 shadow-md"
                            style={{ height: `${barPct}%`, marginTop: `${100 - barPct}%` }}
                          />
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-zinc-400 font-bold whitespace-nowrap mt-1 sm:mt-0">{d.label}</span>
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
            <BorderGlow {...OVERVIEW_GLOW} className="w-full">
              <div className="p-4 sm:p-5 space-y-3 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#194793]" />
                  <h3 className="text-sm font-heading font-extrabold text-[#194793] [text-shadow:1px_1px_0px_#121421]">AI Clinical Insights</h3>
                </div>
                {insights.map((tip, i) => (
                  <p key={i} className="text-sm text-zinc-200 pl-7 leading-relaxed font-medium">• {tip}</p>
                ))}
              </div>
            </BorderGlow>
          )}

          {/* History */}
          <BorderGlow {...OVERVIEW_GLOW} className="w-full">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-[#194793] text-white flex items-center justify-center font-bold shadow-md">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-heading font-extrabold text-[#194793] [text-shadow:1px_1px_0px_#121421]">Today's Readings</h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#121421] text-[#194793] border border-[#727578]/40">
                  {mounted ? readings.length : 0} entries
                </span>
              </div>

              {!mounted || readings.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-6">No readings logged today.</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 pb-16 sm:pb-2">
                  {[...readings].reverse().map((r) => {
                    const status = getSugarStatus(r.value);
                    return (
                      <div key={r.id} className="flex flex-col min-[380px]:flex-row items-start min-[380px]:items-center justify-between gap-2 px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-2xl bg-[#121421] border border-[#727578]/40 hover:border-[#194793] transition-colors">
                        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                          <span className="text-xl sm:text-2xl font-heading font-extrabold text-[#194793] [text-shadow:1px_1px_0px_#121421]">{r.value}</span>
                          <span className="text-xs font-bold text-zinc-400">mg/dL</span>
                          <span className="text-[10px] sm:text-xs font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border bg-[#121421] border-[#727578]/40 text-white">
                            {status.emoji} {status.label}
                          </span>
                        </div>
                        <div className="text-left min-[380px]:text-right w-full min-[380px]:w-auto border-t min-[380px]:border-0 border-[#727578]/20 pt-1.5 min-[380px]:pt-0">
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
