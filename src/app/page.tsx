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

const MONO_GLOW = {
  backgroundColor: "#09090b",
  glowColor: "0 0 100",
  colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
  borderRadius: 24,
};

export default function SmartDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [dayData, setDayData] = useState<DayData | null>(null);

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

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" suppressHydrationWarning>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent" suppressHydrationWarning />
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
      <BorderGlow {...MONO_GLOW} className="w-full">
        <section className="relative overflow-hidden p-8 md:p-10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold border border-zinc-800">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-white" /> AI-Powered Clinical Companion
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight leading-tight">
                {greeting},{" "}
                <span className="text-white underline decoration-zinc-600 underline-offset-8">
                  {profile?.name || "Patient"}
                </span>! 👋
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-lg font-medium">
                {motivation}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/glucose" className="px-6 py-3.5 rounded-full bg-white text-black font-extrabold shadow-lg shadow-white/20 text-sm flex items-center gap-2 hover:scale-105 transition-all">
                Log Sugar <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => setIsOnboardingOpen(true)} className="px-6 py-3.5 rounded-full bg-zinc-900 border border-zinc-800 text-white font-bold text-sm hover:border-zinc-600 transition-all">
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
        <BorderGlow {...MONO_GLOW} className="w-full h-full">
          <div className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Sugar Status</span>
              <Activity className="w-4 h-4 text-white" />
            </div>
            {lastSugar ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-heading font-extrabold text-white">{lastSugar.value}</span>
                  <span className="text-xs font-bold text-zinc-400">mg/dL</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs font-extrabold text-white">
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
        <BorderGlow {...MONO_GLOW} className="w-full h-full">
          <div className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Hydration</span>
              <Droplet className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-heading font-extrabold text-white">
                {(totalWater / 1000).toFixed(1)}L <span className="text-xs font-normal text-zinc-400">/ {(waterTarget / 1000).toFixed(1)}L</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-900 mt-2 overflow-hidden border border-zinc-800">
                <div className="h-full rounded-full bg-white transition-all duration-700 shadow-md shadow-white/30" style={{ width: `${waterPct}%` }} />
              </div>
            </div>
          </div>
        </BorderGlow>

        {/* Calories */}
        <BorderGlow {...MONO_GLOW} className="w-full h-full">
          <div className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Calories</span>
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-heading font-extrabold text-white">
                {totalCal} <span className="text-xs font-normal text-zinc-400">/ {calTarget} kcal</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-900 mt-2 overflow-hidden border border-zinc-800">
                <div className="h-full rounded-full bg-zinc-300 transition-all duration-700" style={{ width: `${Math.min(Math.round((totalCal / calTarget) * 100), 100)}%` }} />
              </div>
            </div>
          </div>
        </BorderGlow>

        {/* Exercise & Sleep Mini */}
        <BorderGlow {...MONO_GLOW} className="w-full h-full">
          <div className="p-5 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Exercise</span>
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-heading font-extrabold text-white">{exerciseMin} <span className="text-xs font-normal text-zinc-400">min</span></span>
            </div>
            <div className="border-t border-zinc-800 pt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Sleep</span>
                <Moon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-heading font-extrabold text-white">
                {sleepHrs != null ? `${sleepHrs}h` : "—"} <span className="text-xs font-normal text-zinc-400">{sleepHrs != null && sleepHrs >= 7 ? "Good" : "Log it"}</span>
              </span>
            </div>
          </div>
        </BorderGlow>
      </section>

      {/* ===== AI HEALTH TIP ===== */}
      <BorderGlow {...MONO_GLOW} className="w-full">
        <section className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center shrink-0 font-bold">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">AI Clinical Insight</span>
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
        <h2 className="text-xl font-heading font-extrabold text-white mb-4">Health Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { href: "/glucose", label: "Glucose", icon: Activity },
            { href: "/water", label: "Water", icon: Droplet },
            { href: "/meals", label: "Diet Plan", icon: Utensils },
            { href: "/workout", label: "Workout", icon: Dumbbell },
            { href: "/meds", label: "Medication", icon: Pill },
            { href: "/sleep", label: "Sleep", icon: Moon },
          ].map(({ href, label, icon: Icon }) => (
            <BorderGlow key={href} {...MONO_GLOW} className="w-full">
              <Link
                href={href}
                className="group p-5 flex flex-col items-center text-center hover:scale-105 transition-all duration-300 w-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center mb-3 group-hover:bg-white group-hover:text-black transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-heading font-extrabold text-white">{label}</span>
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
