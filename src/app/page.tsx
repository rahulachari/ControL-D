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
  backgroundColor: "#ffffff",
  glowColor: "14 165 233", // sky-500
  colors: ["#0ea5e9", "#e2e8f0", "#ffffff"],
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
          <div className="w-24 h-24 rounded-[2rem] overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(14,165,233,0.2)] border border-slate-200 bg-white" suppressHydrationWarning>
            <img src="/logo.png" alt="ControL-D Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-heading font-black text-slate-800 tracking-widest uppercase">ControL-D</h1>
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
        <section className="relative overflow-hidden p-6 sm:p-8 bg-white rounded-[40px] border border-slate-200 shadow-sm transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-indigo-50 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-sky-600 text-xs font-bold border border-sky-100 shadow-sm">
                <Sparkles className="w-4 h-4 animate-pulse text-sky-500" /> AI-Powered Clinical Companion
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-black text-slate-900 tracking-tight leading-tight">
                {greeting},{" "}
                <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
                  {profile?.name || "Patient"}
                </span>!
              </h1>
              <p className="text-slate-600 text-sm leading-relaxed max-w-lg font-medium">
                {motivation}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
              <Link href="/glucose" className="w-full sm:w-auto justify-center px-6 py-4 rounded-[2rem] bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-bold shadow-[0_4px_15px_rgba(14,165,233,0.3)] text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
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
          <div className="p-5 flex flex-col justify-between h-full bg-white rounded-[40px] border border-slate-200 relative overflow-hidden group shadow-sm">
            <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sugar Status</span>
                <Activity className="w-5 h-5 text-blue-500 icon-3d-hover" />
              </div>
              {lastSugar ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-heading font-black text-slate-900">{lastSugar.value}</span>
                    <span className="text-xs font-bold text-slate-500">mg/dL</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-slate-600">
                    {sugarStatus?.emoji} {sugarStatus?.label}
                    <span className="text-slate-400 ml-1">• {lastSugar.context.replace(/_/g, " ")}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-400 font-medium">No readings today</div>
              )}
            </div>
          </div>
        </BorderGlow>

        {/* Water Progress */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full card-3d-hover">
          <div className="p-5 flex flex-col justify-between h-full bg-white rounded-[40px] border border-slate-200 relative overflow-hidden group shadow-sm">
            <div className="absolute inset-0 bg-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hydration</span>
                <Droplet className="w-5 h-5 text-cyan-500 icon-3d-hover" />
              </div>
              <div>
                <div className="text-3xl font-heading font-black text-slate-900">
                  {(totalWater / 1000).toFixed(1)}L <span className="text-xs font-medium text-slate-400">/ {(waterTarget / 1000).toFixed(1)}L</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 mt-3 overflow-hidden border border-slate-200">
                  <div className="h-full rounded-full bg-cyan-500 transition-all duration-700 shadow-sm" style={{ width: `${waterPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </BorderGlow>

        {/* Calories */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full card-3d-hover">
          <div className="p-5 flex flex-col justify-between h-full bg-white rounded-[40px] border border-slate-200 relative overflow-hidden group shadow-sm">
            <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Calories</span>
                <Flame className="w-5 h-5 text-orange-500 icon-3d-hover" />
              </div>
              <div>
                <div className="text-3xl font-heading font-black text-slate-900">
                  {totalCal} <span className="text-xs font-medium text-slate-400">/ {calTarget} kcal</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 mt-3 overflow-hidden border border-slate-200">
                  <div className="h-full rounded-full bg-orange-500 transition-all duration-700 shadow-sm" style={{ width: `${Math.min(Math.round((totalCal / calTarget) * 100), 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </BorderGlow>

        {/* Exercise & Sleep Mini */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full card-3d-hover">
          <div className="p-5 space-y-4 h-full flex flex-col justify-between bg-white rounded-[40px] border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Exercise</span>
                <Dumbbell className="w-4 h-4 text-purple-500 icon-3d-hover" />
              </div>
              <span className="text-2xl font-heading font-black text-slate-900">{exerciseMin} <span className="text-xs font-medium text-slate-400">min</span></span>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sleep</span>
                <Moon className="w-4 h-4 text-indigo-500 icon-3d-hover" />
              </div>
              <span className="text-2xl font-heading font-black text-slate-900">
                {sleepHrs != null ? `${sleepHrs}h` : "—"} <span className="text-xs font-medium text-slate-400">{sleepHrs != null && sleepHrs >= 7 ? "Good" : "Log it"}</span>
              </span>
            </div>
          </div>
        </BorderGlow>
      </section>

      {/* ===== AI HEALTH TIP ===== */}
      <BorderGlow {...OVERVIEW_GLOW} className="w-full card-3d-hover">
        <section className="p-5 sm:p-6 flex items-start gap-4 bg-white rounded-[40px] border border-slate-200 relative overflow-hidden group shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-12 h-12 rounded-[1.25rem] bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 icon-3d-hover z-10 relative">
            <Brain className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">AI Clinical Insight</span>
            <p className="text-sm text-slate-600 mt-1.5 font-medium leading-relaxed">{aiTip}</p>
          </div>
        </section>
      </BorderGlow>

      {/* ===== MOOD TRACKER ===== */}
      <MoodTracker />

      {/* ===== DAILY GOALS ===== */}
      <DailyGoals />

      {/* ===== QUICK NAV MODULES ===== */}
      <section>
        <h2 className="text-xl font-heading font-black text-slate-900 mb-4 pl-2">Health Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { href: "/glucose", label: "Glucose", icon: Activity, color: "text-blue-500", bgHover: "hover:bg-blue-50", borderHover: "hover:border-blue-200" },
            { href: "/water", label: "Water", icon: Droplet, color: "text-cyan-500", bgHover: "hover:bg-cyan-50", borderHover: "hover:border-cyan-200" },
            { href: "/meals", label: "Diet Plan", icon: Utensils, color: "text-orange-500", bgHover: "hover:bg-orange-50", borderHover: "hover:border-orange-200" },
            { href: "/workout", label: "Workout", icon: Dumbbell, color: "text-purple-500", bgHover: "hover:bg-purple-50", borderHover: "hover:border-purple-200" },
            { href: "/meds", label: "Medication", icon: Pill, color: "text-emerald-500", bgHover: "hover:bg-emerald-50", borderHover: "hover:border-emerald-200" },
            { href: "/sleep", label: "Sleep", icon: Moon, color: "text-indigo-500", bgHover: "hover:bg-indigo-50", borderHover: "hover:border-indigo-200" },
          ].map(({ href, label, icon: Icon, color, bgHover, borderHover }) => (
            <BorderGlow key={href} {...OVERVIEW_GLOW} className="w-full card-3d-hover">
              <Link
                href={href}
                className={`group p-5 flex flex-col items-center text-center w-full bg-white rounded-[32px] border border-slate-200 shadow-sm transition-all duration-300 ${bgHover} ${borderHover}`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 shadow-sm icon-3d-hover ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-heading font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
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
