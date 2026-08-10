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
  backgroundColor: "#121421",
  glowColor: "215 71 34", // text-[#194793] style glow
  colors: ["#194793", "#727578", "#121421"],
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
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#121421]" suppressHydrationWarning>
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
  const sleepHrs = dayData?.sleep?.hours;
  const motivation = getDailyMotivation();
  const aiTip = getAIHealthTip();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-16">

      {/* ===== HERO / GREETING ===== */}
      <BorderGlow {...OVERVIEW_GLOW} className="w-full card-3d-hover group">
        <section className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-[#727578]/20 via-[#121421] to-[#121421] rounded-[40px] border border-[#727578]/30 shadow-xl transition-all">
          <div className="absolute inset-0 bg-[#194793]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121421] text-[#194793] text-xs font-black border border-[#727578]/40 shadow-sm">
                <Sparkles className="w-4 h-4 animate-pulse text-[#194793]" /> AI-Powered Clinical Companion
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-black text-[#194793] tracking-tight leading-tight [text-shadow:2px_2px_0px_#121421]">
                {greeting},{" "}
                <span className="text-[#194793] underline decoration-[#727578] underline-offset-8">
                  {profile?.name || "Patient"}
                </span>!
              </h1>
              <p className="text-zinc-300 text-sm leading-relaxed max-w-lg font-medium">
                {motivation}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
              <Link href="/glucose" className="w-full sm:w-auto justify-center px-6 py-4 rounded-[2rem] bg-[#194793] hover:bg-[#194793]/90 text-white font-black shadow-[0_4px_15px_rgba(25,71,147,0.3)] text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border border-[#727578]/40">
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
          <div className="p-5 flex flex-col justify-between h-full bg-gradient-to-br from-[#727578]/15 via-[#121421] to-[#121421] rounded-[40px] border border-[#727578]/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#194793]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#194793]">Sugar Status</span>
                <Activity className="w-5 h-5 text-[#194793] icon-3d-hover" />
              </div>
              {lastSugar ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-heading font-black text-[#194793] [text-shadow:1.5px_1.5px_0px_#121421]">{lastSugar.value}</span>
                    <span className="text-xs font-bold text-zinc-400">mg/dL</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-extrabold text-zinc-200">
                    {sugarStatus?.emoji} {sugarStatus?.label}
                    <span className="text-zinc-400 font-semibold ml-1">• {lastSugar.context.replace(/_/g, " ")}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-zinc-400 font-medium">No readings today</div>
              )}
            </div>
          </div>
        </BorderGlow>

        {/* Water Progress */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full card-3d-hover">
          <div className="p-5 flex flex-col justify-between h-full bg-gradient-to-br from-[#727578]/15 via-[#121421] to-[#121421] rounded-[40px] border border-[#727578]/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#194793]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#194793]">Hydration</span>
                <Droplet className="w-5 h-5 text-[#194793] icon-3d-hover" />
              </div>
              <div>
                <div className="text-3xl font-heading font-black text-[#194793] [text-shadow:1.5px_1.5px_0px_#121421]">
                  {(totalWater / 1000).toFixed(1)}L <span className="text-xs font-normal text-zinc-400">/ {(waterTarget / 1000).toFixed(1)}L</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#121421] mt-3 overflow-hidden border border-[#727578]/40">
                  <div className="h-full rounded-full bg-[#194793] transition-all duration-700 shadow-md shadow-[#194793]/40" style={{ width: `${waterPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </BorderGlow>

        {/* Calories */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full card-3d-hover">
          <div className="p-5 flex flex-col justify-between h-full bg-gradient-to-br from-[#727578]/15 via-[#121421] to-[#121421] rounded-[40px] border border-[#727578]/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#194793]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#194793]">Calories</span>
                <Flame className="w-5 h-5 text-[#194793] icon-3d-hover" />
              </div>
              <div>
                <div className="text-3xl font-heading font-black text-[#194793] [text-shadow:1.5px_1.5px_0px_#121421]">
                  {totalCal} <span className="text-xs font-normal text-zinc-400">/ {calTarget} kcal</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#121421] mt-3 overflow-hidden border border-[#727578]/40">
                  <div className="h-full rounded-full bg-[#194793] transition-all duration-700 shadow-md shadow-[#194793]/40" style={{ width: `${Math.min(Math.round((totalCal / calTarget) * 100), 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </BorderGlow>

        {/* Exercise & Sleep Mini */}
        <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full card-3d-hover">
          <div className="p-5 space-y-4 h-full flex flex-col justify-between bg-gradient-to-br from-[#727578]/15 via-[#121421] to-[#121421] rounded-[40px] border border-[#727578]/30">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#194793]">Exercise</span>
                <Dumbbell className="w-4 h-4 text-[#194793] icon-3d-hover" />
              </div>
              <span className="text-2xl font-heading font-black text-[#194793] [text-shadow:1.5px_1.5px_0px_#121421]">{exerciseMin} <span className="text-xs font-normal text-zinc-400">min</span></span>
            </div>
            <div className="border-t border-[#727578]/30 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#194793]">Sleep</span>
                <Moon className="w-4 h-4 text-[#194793] icon-3d-hover" />
              </div>
              <span className="text-2xl font-heading font-black text-[#194793] [text-shadow:1.5px_1.5px_0px_#121421]">
                {sleepHrs != null ? `${sleepHrs}h` : "—"} <span className="text-xs font-normal text-zinc-400">{sleepHrs != null && sleepHrs >= 7 ? "Good" : "Log it"}</span>
              </span>
            </div>
          </div>
        </BorderGlow>
      </section>

      {/* ===== AI HEALTH TIP ===== */}
      <BorderGlow {...OVERVIEW_GLOW} className="w-full card-3d-hover">
        <section className="p-5 sm:p-6 flex items-start gap-4 bg-gradient-to-r from-[#727578]/20 via-[#121421] to-[#121421] rounded-[40px] border border-[#727578]/40 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#194793]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="w-12 h-12 rounded-[1.25rem] bg-[#194793] text-white flex items-center justify-center shrink-0 shadow-[0_4px_15px_rgba(25,71,147,0.4)] icon-3d-hover z-10 relative">
            <Brain className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <span className="text-xs font-black text-[#194793] uppercase tracking-wider">AI Clinical Insight</span>
            <p className="text-sm text-zinc-200 mt-1.5 font-medium leading-relaxed">{aiTip}</p>
          </div>
        </section>
      </BorderGlow>

      {/* ===== MOOD TRACKER ===== */}
      <MoodTracker />

      {/* ===== DAILY GOALS ===== */}
      <DailyGoals />

      {/* ===== QUICK NAV MODULES ===== */}
      <section>
        <h2 className="text-xl font-heading font-black text-[#194793] mb-4 pl-2 [text-shadow:1.5px_1.5px_0px_#121421]">Health Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { href: "/glucose", label: "Glucose", icon: Activity },
            { href: "/water", label: "Water", icon: Droplet },
            { href: "/meals", label: "Diet Plan", icon: Utensils },
            { href: "/workout", label: "Workout", icon: Dumbbell },
            { href: "/meds", label: "Medication", icon: Pill },
            { href: "/sleep", label: "Sleep", icon: Moon },
          ].map(({ href, label, icon: Icon }) => (
            <BorderGlow key={href} {...OVERVIEW_GLOW} className="w-full card-3d-hover">
              <Link
                href={href}
                className={`group p-5 flex flex-col items-center text-center w-full bg-gradient-to-b from-[#727578]/15 to-[#121421] rounded-[32px] border border-[#727578]/30 transition-all duration-300 hover:border-[#194793] hover:bg-[#194793]/10`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-[#121421] border border-[#727578]/40 flex items-center justify-center mb-3 shadow-sm icon-3d-hover text-[#194793] group-hover:bg-[#194793] group-hover:text-white transition-all`}>
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
