"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity, Droplet, Utensils, Dumbbell, Pill,
  ArrowRight, Sparkles, Moon, Flame, Brain
} from "lucide-react";
import OnboardingModal from "@/components/profile/OnboardingModal";
import HealthScoreCard from "@/components/dashboard/HealthScoreCard";
import DailyGoals from "@/components/dashboard/DailyGoals";
import MoodTracker from "@/components/dashboard/MoodTracker";
import Achievements from "@/components/dashboard/Achievements";
import BorderGlow from "@/components/ui/BorderGlow";
import {
  getProfile, getDayData, getLatestSugar, getSugarStatus,
  getTotalWater, getTotalCalories, getTotalExerciseMinutes,
  getDailyMotivation, getAIHealthTip,
  type UserProfile, type DayData
} from "@/lib/healthStore";

const OVERVIEW_GLOW = {
  backgroundColor: "#050505",
  glowColor: "92 59 207",
  colors: ["#5c3bcf", "#2a2a35", "#050505"],
  borderRadius: 40,
};

export default function SmartDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (!loggedIn) { router.replace("/login"); return; }
    setIsAuthenticated(true);

    const saved = localStorage.getItem("userProfile");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p && p.name && p.name.trim().length > 0 && p.name !== "User") {
          setProfile(p);
        } else {
          setIsOnboardingOpen(true);
        }
      } catch {
        setIsOnboardingOpen(true);
      }
    } else {
      setIsOnboardingOpen(true);
    }
    setDayData(getDayData());
  }, [router]);

  if (isAuthenticated === null || showSplash) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-matrix bg-fixed" suppressHydrationWarning>
        <div className="flex flex-col items-center gap-5 animate-in fade-in zoom-in duration-700" suppressHydrationWarning>
          <div className="w-24 h-24 rounded-[2rem] overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(92,59,207,0.5)] border border-white/10" suppressHydrationWarning>
            <img src="/logo.png" alt="ControL-D Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-heading font-black text-white tracking-widest uppercase shadow-purple-500/50 drop-shadow-lg">ControL-D</h1>
        </div>
      </div>
    );
  }

  const lastSugar = getLatestSugar();
  const sugarStatus = lastSugar ? getSugarStatus(lastSugar.value) : null;
  const totalWater = getTotalWater();
  const waterTarget = profile ? Math.round(profile.weight * 35) : 2450;
  const waterPct = Math.min(Math.round((totalWater / waterTarget) * 100), 100);
  const totalCal = getTotalCalories();
  const calTarget = profile?.targetCalories || 2100;
  const exerciseMin = getTotalExerciseMinutes();
  const sleepHrs = dayData?.sleep?.hours;
  const motivation = getDailyMotivation();
  const aiTip = getAIHealthTip();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-16">

      {/* ===== HERO / GREETING ===== */}
      <BorderGlow {...OVERVIEW_GLOW} className="w-full card-3d-hover group">
        <section className="relative overflow-hidden p-6 sm:p-8 bg-[rgba(20,20,25,0.4)] backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl transition-all">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-blue-900/20 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 text-purple-300 text-xs font-black border border-white/10 shadow-inner">
                <Sparkles className="w-4 h-4 animate-pulse text-purple-400" /> AI-Powered Clinical Companion
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-black text-white tracking-tight leading-tight drop-shadow-md">
                {greeting},{" "}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {profile?.name || "Patient"}
                </span>!
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-lg font-medium">
                {motivation}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
              <Link href="/glucose" className="w-full sm:w-auto justify-center px-6 py-4 rounded-[2rem] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold shadow-[0_0_20px_rgba(92,59,207,0.4)] text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border border-white/20">
                Log Sugar <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </BorderGlow>

      {/* ===== STATUS GRID — Top Row ===== */}
      <section className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">

        {/* Health Score */}
        <HealthScoreCard />

        {/* Sugar Status */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full card-3d-hover">
          <div className="p-5 flex flex-col justify-between h-full bg-[rgba(20,20,25,0.4)] backdrop-blur-2xl rounded-[40px] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sugar Status</span>
                <Activity className="w-5 h-5 text-blue-400 icon-3d-hover drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
              </div>
              {lastSugar ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-heading font-black text-white">{lastSugar.value}</span>
                    <span className="text-xs font-bold text-zinc-500">mg/dL</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-zinc-300">
                    {sugarStatus?.emoji} {sugarStatus?.label}
                    <span className="text-zinc-500 ml-1">• {lastSugar.context.replace(/_/g, " ")}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-zinc-500 font-medium">No readings today</div>
              )}
            </div>
          </div>
        </BorderGlow>

        {/* Water Progress */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full card-3d-hover">
          <div className="p-5 flex flex-col justify-between h-full bg-[rgba(20,20,25,0.4)] backdrop-blur-2xl rounded-[40px] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hydration</span>
                <Droplet className="w-5 h-5 text-cyan-400 icon-3d-hover drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              </div>
              <div>
                <div className="text-3xl font-heading font-black text-white">
                  {(totalWater / 1000).toFixed(1)}L <span className="text-xs font-medium text-zinc-500">/ {(waterTarget / 1000).toFixed(1)}L</span>
                </div>
                <div className="h-2.5 rounded-full bg-black/40 mt-3 overflow-hidden border border-white/5">
                  <div className="h-full rounded-full bg-cyan-400 transition-all duration-700 shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ width: `${waterPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </BorderGlow>

        {/* Calories */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full card-3d-hover">
          <div className="p-5 flex flex-col justify-between h-full bg-[rgba(20,20,25,0.4)] backdrop-blur-2xl rounded-[40px] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Calories</span>
                <Flame className="w-5 h-5 text-orange-400 icon-3d-hover drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
              </div>
              <div>
                <div className="text-3xl font-heading font-black text-white">
                  {totalCal} <span className="text-xs font-medium text-zinc-500">/ {calTarget} kcal</span>
                </div>
                <div className="h-2.5 rounded-full bg-black/40 mt-3 overflow-hidden border border-white/5">
                  <div className="h-full rounded-full bg-orange-400 transition-all duration-700 shadow-[0_0_10px_rgba(251,146,60,0.8)]" style={{ width: `${Math.min(Math.round((totalCal / calTarget) * 100), 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </BorderGlow>

        {/* Exercise & Sleep Mini */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full card-3d-hover">
          <div className="p-5 space-y-4 h-full flex flex-col justify-between bg-[rgba(20,20,25,0.4)] backdrop-blur-2xl rounded-[40px] border border-white/5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Exercise</span>
                <Dumbbell className="w-4 h-4 text-purple-400 icon-3d-hover" />
              </div>
              <span className="text-2xl font-heading font-black text-white">{exerciseMin} <span className="text-xs font-medium text-zinc-500">min</span></span>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sleep</span>
                <Moon className="w-4 h-4 text-indigo-400 icon-3d-hover" />
              </div>
              <span className="text-2xl font-heading font-black text-white">
                {sleepHrs != null ? `${sleepHrs}h` : "—"} <span className="text-xs font-medium text-zinc-500">{sleepHrs != null && sleepHrs >= 7 ? "Good" : "Log it"}</span>
              </span>
            </div>
          </div>
        </BorderGlow>
      </section>

      {/* ===== AI HEALTH TIP ===== */}
      <BorderGlow {...OVERVIEW_GLOW} className="w-full card-3d-hover">
        <section className="p-5 sm:p-6 flex items-start gap-4 bg-[rgba(20,20,25,0.4)] backdrop-blur-2xl rounded-[40px] border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-tr from-purple-600 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(92,59,207,0.5)] icon-3d-hover z-10 relative border border-white/20">
            <Brain className="w-6 h-6 drop-shadow-md" />
          </div>
          <div className="relative z-10">
            <span className="text-xs font-black text-purple-400 uppercase tracking-wider">AI Clinical Insight</span>
            <p className="text-sm text-zinc-300 mt-1.5 font-medium leading-relaxed">{aiTip}</p>
          </div>
        </section>
      </BorderGlow>

      {/* ===== MOOD TRACKER ===== */}
      <MoodTracker />

      {/* ===== DAILY GOALS ===== */}
      <DailyGoals />

      {/* ===== QUICK NAV MODULES ===== */}
      <section>
        <h2 className="text-xl font-heading font-black text-white mb-4 pl-2">Health Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { href: "/glucose", label: "Glucose", icon: Activity, color: "text-blue-400", bgHover: "hover:bg-blue-500/20", borderHover: "hover:border-blue-500/50" },
            { href: "/water", label: "Water", icon: Droplet, color: "text-cyan-400", bgHover: "hover:bg-cyan-500/20", borderHover: "hover:border-cyan-500/50" },
            { href: "/meals", label: "Diet Plan", icon: Utensils, color: "text-orange-400", bgHover: "hover:bg-orange-500/20", borderHover: "hover:border-orange-500/50" },
            { href: "/workout", label: "Workout", icon: Dumbbell, color: "text-purple-400", bgHover: "hover:bg-purple-500/20", borderHover: "hover:border-purple-500/50" },
            { href: "/meds", label: "Medication", icon: Pill, color: "text-emerald-400", bgHover: "hover:bg-emerald-500/20", borderHover: "hover:border-emerald-500/50" },
            { href: "/sleep", label: "Sleep", icon: Moon, color: "text-indigo-400", bgHover: "hover:bg-indigo-500/20", borderHover: "hover:border-indigo-500/50" },
          ].map(({ href, label, icon: Icon, color, bgHover, borderHover }) => (
            <BorderGlow key={href} {...OVERVIEW_GLOW} className="w-full card-3d-hover">
              <Link
                href={href}
                className={`group p-5 flex flex-col items-center text-center w-full bg-[rgba(20,20,25,0.4)] backdrop-blur-2xl rounded-[32px] border border-white/5 transition-all duration-300 ${bgHover} ${borderHover}`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-3 shadow-inner icon-3d-hover ${color}`}>
                  <Icon className="w-6 h-6 drop-shadow-md" />
                </div>
                <span className="text-sm font-heading font-bold text-zinc-300 group-hover:text-white transition-colors">{label}</span>
              </Link>
            </BorderGlow>
          ))}
        </div>
      </section>

      {/* ===== ACHIEVEMENTS ===== */}
      <Achievements />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSave={(p) => { setProfile(p); setDayData(getDayData()); }}
      />
    </div>
  );
}
