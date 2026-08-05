"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Activity, Droplet, Pill, Dumbbell, Moon, Brain, Heart } from "lucide-react";
import { getProfile, getWeeklyData, calculateHealthScore, type UserProfile, type DayData } from "@/lib/healthStore";

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
  const [healthScore, setHealthScore] = useState({ score: 0, grade: "", color: "" });
  const [reportDate, setReportDate] = useState("");

  useEffect(() => {
    setMounted(true);
    setProfile(getProfile());
    setWeeklyData(getWeeklyData());
    setHealthScore(calculateHealthScore());
    setReportDate(new Date().toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" }));
  }, []);

  const handlePrint = () => window.print();

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  // Weekly aggregates
  const avgSugar = (() => {
    const allReadings = weeklyData.flatMap((d) => d.sugar.map((s) => s.value));
    return allReadings.length > 0 ? Math.round(allReadings.reduce((s, v) => s + v, 0) / allReadings.length) : 0;
  })();

  const totalWaterWeek = weeklyData.reduce((s, d) => s + d.water.reduce((ws, w) => ws + w.amount, 0), 0);
  const avgWaterPerDay = weeklyData.length > 0 ? (totalWaterWeek / weeklyData.length / 1000).toFixed(1) : "0";

  const totalExerciseWeek = weeklyData.reduce((s, d) => s + d.workouts.reduce((ws, w) => ws + w.duration, 0), 0);
  const avgExercisePerDay = weeklyData.length > 0 ? Math.round(totalExerciseWeek / weeklyData.length) : 0;

  const avgSleep = (() => {
    const sleepDays = weeklyData.filter((d) => d.sleep);
    return sleepDays.length > 0 ? (sleepDays.reduce((s, d) => s + (d.sleep?.hours || 0), 0) / sleepDays.length).toFixed(1) : "—";
  })();

  const medsAdherence = (() => {
    const daysWithMeds = weeklyData.filter((d) => d.meds.length > 0);
    if (daysWithMeds.length === 0) return 100;
    return Math.round(daysWithMeds.reduce((s, d) => s + (d.meds.filter((m) => m.status === "taken").length / d.meds.length) * 100, 0) / daysWithMeds.length);
  })();

  const hba1c = avgSugar > 0 ? ((avgSugar + 46.7) / 28.7).toFixed(1) : "—";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:hidden">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight flex items-center gap-2 mb-1.5">
            <FileText className="w-7 h-7 text-zinc-400" /> Health Report
          </h1>
          <p className="text-zinc-400 text-sm">Generate a summary report for your doctor.</p>
        </div>
        <button onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white text-black font-black shadow-[0_0_20px_rgba(255,255,255,0.2)] text-sm flex items-center justify-center gap-2 hover:scale-105 transition-all shrink-0">
          <Download className="w-4 h-4" /> Download Report (PDF)
        </button>
      </div>

      {/* Report Container */}
      <div className="bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 rounded-[32px] p-5 sm:p-8 shadow-2xl space-y-8 print:bg-white print:border-none print:shadow-none">

        {/* Header */}
        <div className="text-center border-b border-zinc-800 pb-6">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center text-xs font-black shadow-[0_0_15px_rgba(255,255,255,0.2)]">CD</div>
            <span className="font-heading font-black text-lg text-white">ControL-D Health Report</span>
          </div>
          <p className="text-xs font-bold text-zinc-500">Generated: {reportDate} • Weekly Summary (Last 7 Days)</p>
        </div>

        {/* Patient Info */}
        {profile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div><span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Name</span><span className="text-sm font-black text-white">{profile.name}</span></div>
            <div><span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Age</span><span className="text-sm font-black text-white">{profile.age} yrs</span></div>
            <div><span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Weight</span><span className="text-sm font-black text-white">{profile.weight} kg</span></div>
            <div><span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Diabetes Type</span><span className="text-sm font-black text-white">{profile.diabetesType}</span></div>
          </div>
        )}

        {/* Health Score */}
        <div className="text-center py-4">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Overall Health Score</span>
          <div className="text-6xl font-heading font-extrabold text-white mt-2 mb-1 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{healthScore.score}<span className="text-2xl text-zinc-600">/100</span></div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${healthScore.color} bg-current/10 border border-current/20`}>{healthScore.grade}</span>
        </div>

        {/* Metrics Table */}
        <div>
          <h3 className="text-sm font-heading font-black text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-zinc-400" /> Weekly Health Metrics
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950 hide-scrollbar">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800">
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Metric</th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Value</th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Target</th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {[
                  { label: "Avg Blood Sugar", value: avgSugar > 0 ? `${avgSugar} mg/dL` : "—", target: "70-140 mg/dL", status: avgSugar >= 70 && avgSugar <= 140 ? "✅" : avgSugar > 0 ? "⚠️" : "—", icon: Activity },
                  { label: "Est. HbA1c", value: `${hba1c}%`, target: "< 7.0%", status: parseFloat(hba1c) < 7 ? "✅" : parseFloat(hba1c) > 0 ? "⚠️" : "—", icon: Heart },
                  { label: "Avg Water/Day", value: `${avgWaterPerDay}L`, target: `${profile ? (profile.weight * 0.035).toFixed(1) : "2.5"}L`, status: parseFloat(avgWaterPerDay) >= 2 ? "✅" : "⚠️", icon: Droplet },
                  { label: "Avg Exercise/Day", value: `${avgExercisePerDay} min`, target: "30 min", status: avgExercisePerDay >= 15 ? "✅" : "⚠️", icon: Dumbbell },
                  { label: "Avg Sleep", value: `${avgSleep}h`, target: "7-8h", status: parseFloat(avgSleep as string) >= 7 ? "✅" : avgSleep !== "—" ? "⚠️" : "—", icon: Moon },
                  { label: "Med Adherence", value: `${medsAdherence}%`, target: "100%", status: medsAdherence >= 90 ? "✅" : "⚠️", icon: Pill },
                ].map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-2.5 text-white font-bold text-xs">
                        <Icon className="w-4 h-4 text-zinc-500" /> {row.label}
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-white text-xs">{row.value}</td>
                      <td className="px-5 py-3.5 text-right text-zinc-500 text-[11px] font-bold">{row.target}</td>
                      <td className="px-5 py-3.5 text-right">{row.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] leading-relaxed text-zinc-400 font-medium">
          <strong className="text-white font-bold block mb-1">⚠️ Disclaimer</strong> This report is generated from self-reported data and AI estimates. 
          The estimated HbA1c is for reference only and should not replace clinical lab tests. 
          Always consult your healthcare provider for medical decisions.
        </div>

        <div className="text-center text-[10px] font-bold text-zinc-600 pt-6 border-t border-zinc-800">
          ControL-D — AI Health Care Companion • {reportDate}
        </div>
      </div>
    </div>
  );
}
