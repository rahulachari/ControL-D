"use client";

import { useState, useEffect } from "react";
import { Droplet, Plus, Clock, TrendingUp, Sparkles, Waves } from "lucide-react";
import { addWater, getTotalWater, getDayData, getProfile, getWeeklyData, todayKey, resetWater } from "@/lib/healthStore";
import BorderGlow from "@/components/ui/BorderGlow";
import { playWaterDropSound } from "@/lib/audioEffects";

const OVERVIEW_GLOW = {
  backgroundColor: "#121421",
  glowColor: "215 71 34",
  colors: ["#194793", "#727578", "#121421"],
  borderRadius: 24,
};

const QUICK_AMOUNTS = [
  { label: "100ml", value: 100 },
  { label: "200ml", value: 200 },
  { label: "250ml", value: 250 },
  { label: "500ml", value: 500 },
  { label: "750ml", value: 750 },
  { label: "1L", value: 1000 },
];

export default function WaterTracker() {
  const [total, setTotal] = useState(0);
  const [target, setTarget] = useState(2450);
  const [log, setLog] = useState<{ amount: number; time: string }[]>([]);
  const [customAmount, setCustomAmount] = useState("");
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [animatePulse, setAnimatePulse] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const profile = getProfile();
    const computedTarget = profile ? Math.round(profile.weight * 35) : 2450;
    setTarget(computedTarget);
    setTotal(getTotalWater());
    const day = getDayData();
    setLog(day.water.map((w) => ({ amount: w.amount, time: w.time })));

    const weekly = getWeeklyData();
    setWeeklyData(weekly.map((d) => d.water.reduce((s, w) => s + w.amount, 0)));
  }, []);

  const handleAdd = (amount: number) => {
    if (amount <= 0) return;
    playWaterDropSound();
    addWater(amount);
    setTotal((prev) => prev + amount);
    const day = getDayData();
    setLog(day.water.map((w) => ({ amount: w.amount, time: w.time })));

    setAnimatePulse(true);
    setTimeout(() => setAnimatePulse(false), 600);
  };

  const handleCustomAdd = () => {
    const amt = parseInt(customAmount);
    if (isNaN(amt) || amt <= 0) return;
    handleAdd(amt);
    setCustomAmount("");
  };

  const handleReset = () => {
    if (!confirm("Are you sure you want to reset today's water log?")) return;
    resetWater();
    setTotal(0);
    setLog([]);
  };

  const pct = Math.min(Math.round((total / target) * 100), 100);
  const remaining = Math.max(target - total, 0);

  let hydrationGrade = "Dehydrated";
  let gradeColor = "text-rose-400";
  if (pct >= 100) { hydrationGrade = "Excellent"; gradeColor = "text-[#194793]"; }
  else if (pct >= 75) { hydrationGrade = "Good"; gradeColor = "text-[#194793]"; }
  else if (pct >= 50) { hydrationGrade = "Fair"; gradeColor = "text-zinc-300"; }
  else if (pct >= 25) { hydrationGrade = "Low"; gradeColor = "text-zinc-400"; }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date().getDay();
  const orderedLabels = [...dayLabels.slice((today + 1) % 7), ...dayLabels.slice(0, (today + 1) % 7)];

  if (!mounted) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
    </div>
  );

  return (
    <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">

      {/* ===== Main Bottle & Controls ===== */}
      <div className="lg:col-span-5">
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full">
          <div className="p-4 sm:p-6 flex flex-col items-center text-center bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg">
            <div className="flex items-center gap-2 mb-4 self-start">
              <div className="w-8 h-8 rounded-2xl bg-[#194793] text-white flex items-center justify-center font-bold shadow-md">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-heading font-extrabold text-[#194793] [text-shadow:1px_1px_0px_#121421]">Hydration Monitor</h3>
            </div>

            {/* Animated Bottle SVG */}
            <div className={`relative w-40 h-56 mb-6 transition-transform duration-300 ${animatePulse ? "scale-105" : ""}`}>
              <svg viewBox="0 0 100 140" className="w-full h-full">
                <defs>
                  <clipPath id="bottleClip">
                    <path d="M30 20 L30 10 Q30 5 35 5 L65 5 Q70 5 70 10 L70 20 Q80 25 80 35 L80 125 Q80 135 70 135 L30 135 Q20 135 20 125 L20 35 Q20 25 30 20Z" />
                  </clipPath>
                  <linearGradient id="waterGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#194793" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#727578" stopOpacity="0.7" />
                  </linearGradient>
                </defs>

                {/* Bottle background */}
                <path d="M30 20 L30 10 Q30 5 35 5 L65 5 Q70 5 70 10 L70 20 Q80 25 80 35 L80 125 Q80 135 70 135 L30 135 Q20 135 20 125 L20 35 Q20 25 30 20Z"
                  fill="none" stroke="currentColor" strokeWidth="2" className="text-[#727578]" />

                {/* Water fill */}
                <g clipPath="url(#bottleClip)">
                  <rect x="0" y={135 - (pct / 100) * 130} width="200" height={130}
                    fill="url(#waterGrad)" className="transition-all duration-700 ease-out" />
                  
                  {/* Back Wave */}
                  <path d={`M0 ${135 - (pct / 100) * 130} Q25 ${132 - (pct / 100) * 130} 50 ${135 - (pct / 100) * 130} T100 ${135 - (pct / 100) * 130} T150 ${135 - (pct / 100) * 130} T200 ${135 - (pct / 100) * 130} V140 H0Z`}
                    fill="url(#waterGrad)" opacity="0.6" className="transition-all duration-700" />
                    
                  {/* Front Wave */}
                  <path d={`M0 ${135 - (pct / 100) * 130} Q25 ${137 - (pct / 100) * 130} 50 ${135 - (pct / 100) * 130} T100 ${135 - (pct / 100) * 130} T150 ${135 - (pct / 100) * 130} T200 ${135 - (pct / 100) * 130} V140 H0Z`}
                    fill="url(#waterGrad)" opacity="0.4" className="transition-all duration-700" />
                </g>

                <text x="50" y="80" textAnchor="middle" className="fill-white" fontSize="16" fontWeight="bold" style={{ textShadow: "0 2px 4px rgba(18, 20, 33, 0.8)" }}>
                  {pct}%
                </text>
              </svg>
            </div>

            <div className="mb-2">
              <span className="text-3xl font-heading font-black text-[#194793] [text-shadow:1.5px_1.5px_0px_#121421]">
                {(total / 1000).toFixed(1)}L
              </span>
              <span className="text-sm font-bold text-zinc-400 ml-1">/ {(target / 1000).toFixed(1)}L</span>
            </div>
            <div className={`text-xs font-black ${gradeColor} mb-1 uppercase tracking-widest`}>{hydrationGrade}</div>
            <p className="text-xs font-semibold text-zinc-400 mb-6">{remaining > 0 ? `${remaining}ml remaining` : "🎉 Goal reached!"}</p>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full mb-4">
              {QUICK_AMOUNTS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => handleAdd(value)}
                  className="px-1 sm:px-3 py-2 sm:py-3 rounded-2xl bg-[#121421] hover:bg-[#194793] text-[#194793] hover:text-white font-black text-[10px] min-[360px]:text-[11px] sm:text-sm transition-all border border-[#727578]/40 flex items-center justify-center gap-0.5 whitespace-nowrap shadow-sm min-w-0"
                >
                  <Plus className="w-3 h-3 shrink-0 text-[#194793] group-hover:text-white" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="flex gap-2 w-full">
              <input
                type="number"
                placeholder="Custom ml"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="flex-1 min-w-0 px-3.5 sm:px-4 py-3 rounded-2xl bg-[#121421] border border-[#727578]/40 outline-none text-xs sm:text-sm font-bold text-white placeholder-zinc-500 focus:border-[#194793] transition-all shadow-inner"
              />
              <button
                onClick={handleCustomAdd}
                className="px-4 sm:px-6 py-3 rounded-2xl bg-[#194793] text-white font-black text-xs sm:text-sm shadow-lg shadow-[#121421] hover:scale-105 transition-all border border-[#727578]/40 shrink-0"
              >
                Add
              </button>
            </div>
            
            <button
              onClick={handleReset}
              className="mt-4 w-full py-3 rounded-2xl bg-[#121421] text-rose-400 font-black text-xs hover:bg-rose-500/20 transition-colors border border-[#727578]/40"
            >
              Reset Today's Log
            </button>
          </div>
        </BorderGlow>
      </div>

      {/* ===== Right Column: Log + Weekly ===== */}
      <div className="lg:col-span-7 space-y-4 sm:space-y-6">

        {/* Weekly Chart */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full">
          <div className="p-4 sm:p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-2xl bg-[#194793] text-white flex items-center justify-center font-bold shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-heading font-extrabold text-[#194793] [text-shadow:1px_1px_0px_#121421]">Weekly Hydration</h3>
            </div>
            <div className="flex items-end gap-2 h-40">
              {weeklyData.map((val, i) => {
                const barPct = target > 0 ? Math.min((val / target) * 100, 100) : 0;
                const isToday = i === weeklyData.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-[#194793] font-extrabold">
                      {val > 0 ? `${(val / 1000).toFixed(1)}L` : "—"}
                    </span>
                    <div className="w-full bg-[#121421] rounded-2xl overflow-hidden border border-[#727578]/40" style={{ height: "100px" }}>
                      <div
                        className={`w-full rounded-2xl transition-all duration-500 shadow-md ${
                          isToday ? "bg-[#194793]" : "bg-[#727578]/50"
                        }`}
                        style={{ height: `${barPct}%`, marginTop: `${100 - barPct}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${isToday ? "text-[#194793]" : "text-zinc-400"}`}>
                      {orderedLabels[i] || ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </BorderGlow>

        {/* Today's Log */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full">
          <div className="p-4 sm:p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-[#194793] text-white flex items-center justify-center font-bold shadow-md">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-heading font-extrabold text-[#194793] [text-shadow:1px_1px_0px_#121421]">Today's Log</h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#121421] text-[#194793] border border-[#727578]/40">
                {log.length} entries
              </span>
            </div>

            {log.length === 0 ? (
              <p className="text-sm font-medium text-zinc-400 text-center py-8">No water logged yet today. Start hydrating!</p>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {[...log].reverse().map((entry, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#121421] border border-[#727578]/40 hover:border-[#194793] transition-colors">
                    <div className="flex items-center gap-3">
                      <Droplet className="w-4 h-4 text-[#194793]" />
                      <span className="text-lg font-heading font-extrabold text-[#194793] [text-shadow:1px_1px_0px_#121421]">{entry.amount}ml</span>
                    </div>
                    <span className="text-xs font-bold text-zinc-300">
                      {new Date(entry.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </BorderGlow>
      </div>
    </div>
  );
}
