"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Activity, Droplet, Pill, Dumbbell, Moon, Brain, Heart, Upload, Sparkles } from "lucide-react";
import { getProfile, getWeeklyData, calculateHealthScore, type UserProfile, type DayData } from "@/lib/healthStore";
import ReportAnalyzer from "@/components/reports/ReportAnalyzer";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"analyzer" | "summary">("analyzer");
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
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#194793] border-t-transparent" />
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
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-28 sm:pb-12">

      {/* Header & Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-3xl font-heading font-black text-[#194793] tracking-tight [text-shadow:2px_2px_0px_#121421] flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-[#194793] shrink-0" /> Medical Lab Reports
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm font-medium">
            Upload PDFs for AI analysis or generate summary reports.
          </p>
        </div>

        {activeTab === "summary" && (
          <button onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#194793] text-white font-black shadow-lg shadow-[#121421] text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-105 transition-all shrink-0 border border-[#727578]/40">
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 bg-[#121421] p-1 sm:p-1.5 rounded-2xl border border-[#727578]/40 print:hidden">
        <button
          onClick={() => setActiveTab("analyzer")}
          className={`flex-1 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
            activeTab === "analyzer"
              ? "bg-[#194793] text-white shadow-lg shadow-[#121421]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> <span className="hidden min-[380px]:inline">AI</span> Analyzer
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex-1 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
            activeTab === "summary"
              ? "bg-[#194793] text-white shadow-lg shadow-[#121421]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> Summary
        </button>
      </div>

      {/* TAB 1: AI REPORT ANALYZER */}
      {activeTab === "analyzer" && (
        <ReportAnalyzer />
      )}

      {/* TAB 2: DOCTOR SUMMARY REPORT */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Report Container */}
          <div className="bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] backdrop-blur-2xl border border-[#727578]/30 rounded-[32px] p-5 sm:p-8 shadow-2xl space-y-8 print:bg-white print:border-none print:shadow-none">

            {/* Header */}
            <div className="text-center border-b border-[#727578]/30 pb-6">
              <div className="flex items-center justify-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#727578]/40 shadow-md">
                  <img src="/logo.png" alt="ControL-D Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-heading font-black text-lg bg-gradient-to-r from-[#e8e8e8] via-[#b0b0b0] to-[#8a8a8a] bg-clip-text text-transparent">ControL-D Health Report</span>
              </div>
              <p className="text-xs font-bold text-zinc-400">Generated: {reportDate} • Weekly Summary (Last 7 Days)</p>
            </div>

            {/* Patient Info */}
            {profile && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#121421] border border-[#727578]/40">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Patient</span>
                  <span className="text-sm font-black text-white">{profile.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Age / Gender</span>
                  <span className="text-sm font-black text-white">{profile.age} yrs • {profile.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Condition</span>
                  <span className="text-sm font-black text-white capitalize">{profile.diabetesType.replace("_", " ")}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">BMI / Weight</span>
                  <span className="text-sm font-black text-white">{profile.weight} kg ({profile.height || 175} cm)</span>
                </div>
              </div>
            )}

            {/* Health Score & HbA1c */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-5 rounded-2xl bg-[#121421] border border-[#727578]/40 text-center">
                <span className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Health Score</span>
                <span className={`text-2xl sm:text-4xl font-heading font-black ${healthScore.color} mt-1 block`}>{healthScore.score}</span>
                <span className="text-[10px] sm:text-xs font-bold text-zinc-300">Grade: {healthScore.grade}</span>
              </div>

              <div className="p-3 sm:p-5 rounded-2xl bg-[#121421] border border-[#727578]/40 text-center">
                <span className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Avg Glucose</span>
                <span className="text-2xl sm:text-4xl font-heading font-black text-[#194793] mt-1 block">{avgSugar > 0 ? avgSugar : "—"}</span>
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400">mg/dL</span>
              </div>

              <div className="p-3 sm:p-5 rounded-2xl bg-[#121421] border border-[#727578]/40 text-center">
                <span className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Est. HbA1c</span>
                <span className="text-2xl sm:text-4xl font-heading font-black text-[#194793] mt-1 block">{hba1c}</span>
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400">%</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div>
              <h3 className="text-sm font-heading font-black text-[#194793] uppercase tracking-wider mb-3">7-Day Adherence & Averages</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#727578]/30 text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <th className="py-2 px-2 sm:px-4">Metric</th>
                      <th className="py-2 px-2 sm:px-4 text-right">Value</th>
                      <th className="py-2 px-2 sm:px-4 text-right hidden min-[420px]:table-cell">Target</th>
                      <th className="py-2 px-2 sm:px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#727578]/20">
                    {[
                      { label: "Sugar", value: avgSugar > 0 ? `${avgSugar} mg/dL` : "No data", target: "70-180", status: avgSugar >= 70 && avgSugar <= 180 ? "✅" : "⚠️", icon: Activity },
                      { label: "Water", value: `${avgWaterPerDay}L`, target: `${profile ? (profile.weight * 0.035).toFixed(1) : "2.5"}L`, status: parseFloat(avgWaterPerDay) >= 2 ? "✅" : "⚠️", icon: Droplet },
                      { label: "Exercise", value: `${avgExercisePerDay} min`, target: "30 min", status: avgExercisePerDay >= 15 ? "✅" : "⚠️", icon: Dumbbell },
                      { label: "Sleep", value: `${avgSleep}h`, target: "7-8h", status: parseFloat(avgSleep as string) >= 7 ? "✅" : avgSleep !== "—" ? "⚠️" : "—", icon: Moon },
                      { label: "Meds", value: `${medsAdherence}%`, target: "100%", status: medsAdherence >= 90 ? "✅" : "⚠️", icon: Pill },
                    ].map((row, i) => {
                      const Icon = row.icon;
                      return (
                        <tr key={i} className="hover:bg-[#727578]/10 transition-colors">
                          <td className="px-2 sm:px-4 py-2.5 sm:py-3.5">
                            <span className="flex items-center gap-1.5 sm:gap-2.5 text-white font-bold text-[11px] sm:text-xs">
                              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#194793] shrink-0" /> {row.label}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2.5 sm:py-3.5 text-right font-black text-white text-[11px] sm:text-xs">{row.value}</td>
                          <td className="px-2 sm:px-4 py-2.5 sm:py-3.5 text-right text-zinc-400 text-[10px] sm:text-[11px] font-bold hidden min-[420px]:table-cell">{row.target}</td>
                          <td className="px-2 sm:px-4 py-2.5 sm:py-3.5 text-right">{row.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-2xl bg-[#121421] border border-[#727578]/40 text-[11px] leading-relaxed text-zinc-300 font-medium">
              <strong className="text-[#194793] font-bold block mb-1">⚠️ Disclaimer</strong> This report is generated from self-reported data and AI estimates. 
              The estimated HbA1c is for reference only and should not replace clinical lab tests. 
              Always consult your healthcare provider for medical decisions.
            </div>

            <div className="text-center text-[10px] font-bold text-zinc-500 pt-6 border-t border-[#727578]/30">
              ControL-D — AI Health Care Companion • {reportDate}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
