"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity, Droplet, Utensils, Dumbbell, Pill,
  ArrowRight, Sparkles, Clock, Moon, Flame, Heart,
  TrendingUp, TrendingDown, Minus, Brain
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
  backgroundColor: "#121421",
  glowColor: "215 71 34",
  colors: ["#194793", "#727578", "#121421"],
  borderRadius: 24,
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
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#121421]" suppressHydrationWarning>
        <div className="flex flex-col items-center gap-5 animate-in fade-in zoom-in duration-700" suppressHydrationWarning>
          <div className="w-24 h-24 rounded-[2rem] overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(25,71,147,0.5)] border border-[#727578]/50" suppressHydrationWarning>
            <img src="/logo.png" alt="ControL-D Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-heading font-black bg-gradient-to-r from-[#e8e8e8] via-[#b0b0b0] to-[#8a8a8a] bg-clip-text text-transparent tracking-widest uppercase">ControL-D</h1>
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
  const medsTotal = dayData?.meds.length || 0;
  const medsTaken = dayData?.meds.filter((m) => m.status === "taken").length || 0;
  const sleepHrs = dayData?.sleep?.hours;
  const motivation = getDailyMotivation();
  const aiTip = getAIHealthTip();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">

      {/* ===== HERO / GREETING ===== */}
      <BorderGlow {...OVERVIEW_GLOW} className="w-full">
        <section className="relative overflow-hidden p-8 md:p-10 bg-gradient-to-br from-[#727578]/20 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#121421] text-[#194793] text-xs font-black border border-[#727578]/40 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#194793]" /> AI-Powered Clinical Companion
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-black text-[#194793] tracking-tight leading-tight [text-shadow:2px_2px_0px_#121421]">
                {greeting},{" "}
                <span className="text-[#194793] underline decoration-[#727578] underline-offset-8">
                  {profile?.name || "Patient"}
                </span>! 👋
              </h1>
              <p className="text-zinc-300 text-sm leading-relaxed max-w-lg font-medium">
                {motivation}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:mt-0 w-full sm:w-auto">
              <Link href="/glucose" className="w-full sm:w-auto justify-center px-4 sm:px-6 py-3.5 rounded-full bg-[#194793] hover:bg-[#194793]/90 text-white font-black shadow-lg shadow-[#121421] text-sm flex items-center gap-2 hover:scale-105 transition-all border border-[#727578]/40">
                Log Sugar <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => setIsOnboardingOpen(true)} className="w-full sm:w-auto justify-center px-4 sm:px-6 py-3.5 rounded-full bg-[#121421] border border-[#727578]/50 text-zinc-200 font-bold text-sm hover:border-[#194793] hover:text-[#194793] transition-all">
                Edit Profile
              </button>
            </div>
          </div>
        </section>
      </BorderGlow>

      {/* ===== STATUS GRID — Top Row ===== */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Health Score */}
        <HealthScoreCard />

        {/* Sugar Status */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full">
          <div className="p-5 flex flex-col justify-between h-full bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30">
            <div className="flex items-center justify-between mb-3 gap-1">
              <span className="text-[9px] min-[360px]:text-[10px] font-black uppercase tracking-widest text-[#194793] truncate">Sugar Status</span>
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#194793] shrink-0" />
            </div>
            {lastSugar ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-heading font-black text-[#194793] [text-shadow:1.5px_1.5px_0px_#121421]">{lastSugar.value}</span>
                  <span className="text-xs font-bold text-zinc-400">mg/dL</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs font-extrabold text-zinc-200">
                  {sugarStatus?.emoji} {sugarStatus?.label}
                  <span className="text-zinc-400 font-semibold text-[10px] ml-1">• {lastSugar.context.replace(/_/g, " ")}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-zinc-400 font-medium">No readings today</div>
            )}
          </div>
        </BorderGlow>

        {/* Water Progress */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full">
          <div className="p-5 flex flex-col justify-between h-full bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#194793]">Hydration</span>
              <Droplet className="w-4 h-4 text-[#194793]" />
            </div>
            <div>
              <div className="text-2xl font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">
                {(totalWater / 1000).toFixed(1)}L <span className="text-xs font-normal text-zinc-400">/ {(waterTarget / 1000).toFixed(1)}L</span>
              </div>
              <div className="h-2 rounded-full bg-[#121421] mt-2 overflow-hidden border border-[#727578]/40">
                <div className="h-full rounded-full bg-[#194793] transition-all duration-700 shadow-md shadow-[#194793]/40" style={{ width: `${waterPct}%` }} />
              </div>
            </div>
          </div>
        </BorderGlow>

        {/* Calories */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full">
          <div className="p-5 flex flex-col justify-between h-full bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#194793]">Calories</span>
              <Flame className="w-4 h-4 text-[#194793]" />
            </div>
            <div>
              <div className="text-2xl font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">
                {totalCal} <span className="text-xs font-normal text-zinc-400">/ {calTarget} kcal</span>
              </div>
              <div className="h-2 rounded-full bg-[#121421] mt-2 overflow-hidden border border-[#727578]/40">
                <div className="h-full rounded-full bg-[#194793] transition-all duration-700" style={{ width: `${Math.min(Math.round((totalCal / calTarget) * 100), 100)}%` }} />
              </div>
            </div>
          </div>
        </BorderGlow>

        {/* Exercise & Sleep Mini */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full">
          <div className="p-5 space-y-4 h-full flex flex-col justify-between bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#194793]">Exercise</span>
                <Dumbbell className="w-4 h-4 text-[#194793]" />
              </div>
              <span className="text-xl font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">{exerciseMin} <span className="text-xs font-normal text-zinc-400">min</span></span>
            </div>
            <div className="border-t border-[#727578]/30 pt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#194793]">Sleep</span>
                <Moon className="w-4 h-4 text-[#194793]" />
              </div>
              <span className="text-xl font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421]">
                {sleepHrs != null ? `${sleepHrs}h` : "—"} <span className="text-xs font-normal text-zinc-400">{sleepHrs != null && sleepHrs >= 7 ? "Good" : "Log it"}</span>
              </span>
            </div>
          </div>
        </BorderGlow>
      </section>

      {/* ===== AI HEALTH TIP ===== */}
      <BorderGlow {...OVERVIEW_GLOW} className="w-full">
        <section className="p-5 flex items-start gap-4 bg-gradient-to-r from-[#727578]/20 via-[#121421] to-[#121421] rounded-[24px] border border-[#727578]/40">
          <div className="w-10 h-10 rounded-2xl bg-[#194793] text-white flex items-center justify-center shrink-0 font-black shadow-md shadow-[#121421]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-[#194793] uppercase tracking-wider">AI Clinical Insight</span>
            <p className="text-sm text-zinc-200 mt-1 font-medium leading-relaxed">{aiTip}</p>
          </div>
        </section>
      </BorderGlow>

      {/* ===== MOOD TRACKER ===== */}
      <MoodTracker />

      {/* ===== DAILY GOALS ===== */}
      <DailyGoals />

      {/* ===== QUICK NAV MODULES ===== */}
      <section>
        <h2 className="text-xl font-heading font-black text-[#194793] mb-4 [text-shadow:1.5px_1.5px_0px_#121421]">Health Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { href: "/glucose", label: "Glucose", icon: Activity },
            { href: "/water", label: "Water", icon: Droplet },
            { href: "/meals", label: "Diet Plan", icon: Utensils },
            { href: "/workout", label: "Workout", icon: Dumbbell },
            { href: "/meds", label: "Medication", icon: Pill },
            { href: "/sleep", label: "Sleep", icon: Moon },
          ].map(({ href, label, icon: Icon }) => (
            <BorderGlow key={href} {...OVERVIEW_GLOW} className="w-full">
              <Link
                href={href}
                className="group p-5 flex flex-col items-center text-center hover:scale-105 transition-all duration-300 w-full bg-gradient-to-b from-[#727578]/15 to-[#121421] rounded-[24px] border border-[#727578]/30 hover:border-[#194793]"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#121421] border border-[#727578]/40 text-[#194793] flex items-center justify-center mb-3 group-hover:bg-[#194793] group-hover:text-white transition-all shadow-md">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-heading font-black text-[#194793] group-hover:text-white transition-colors">{label}</span>
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
