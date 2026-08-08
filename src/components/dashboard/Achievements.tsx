"use client";

import { useEffect, useState } from "react";
import { getStreak, getWeeklyData } from "@/lib/healthStore";
import { Trophy, Flame, Droplet, Pill, Salad, Dumbbell, Heart, Crown, Lock } from "lucide-react";
import BorderGlow from "@/components/ui/BorderGlow";

const OVERVIEW_GLOW = {
  backgroundColor: "#121421",
  glowColor: "215 71 34",
  colors: ["#194793", "#727578", "#121421"],
  borderRadius: 24,
};

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  condition: () => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "streak_7",
    title: "7-Day Warrior",
    description: "Complete 3+ goals for 7 consecutive days",
    icon: Flame,
    condition: () => getStreak() >= 7,
  },
  {
    id: "streak_30",
    title: "30-Day Champion",
    description: "Complete 3+ goals for 30 consecutive days",
    icon: Crown,
    condition: () => getStreak() >= 30,
  },
  {
    id: "perfect_water",
    title: "Hydration King",
    description: "Hit your water goal 5 days this week",
    icon: Droplet,
    condition: () => {
      const week = getWeeklyData();
      return week.filter((d) => d.goals.drinkWater).length >= 5;
    },
  },
  {
    id: "med_master",
    title: "Medicine Master",
    description: "Take all medications on time for a full week",
    icon: Pill,
    condition: () => {
      const week = getWeeklyData();
      return week.filter((d) => d.goals.takeMedicines).length >= 7;
    },
  },
  {
    id: "healthy_eating",
    title: "Nutrition Pro",
    description: "Log meals 5 days this week",
    icon: Salad,
    condition: () => {
      const week = getWeeklyData();
      return week.filter((d) => d.meals.length > 0).length >= 5;
    },
  },
  {
    id: "active_beast",
    title: "Activity Beast",
    description: "Exercise 15+ mins for 4 days this week",
    icon: Dumbbell,
    condition: () => {
      const week = getWeeklyData();
      return week.filter((d) => d.goals.exercise).length >= 4;
    },
  },
  {
    id: "sugar_tracker",
    title: "Glucose Monitor",
    description: "Log blood sugar consistently for 5 days",
    icon: Heart,
    condition: () => {
      const week = getWeeklyData();
      return week.filter((d) => d.sugar.length > 0).length >= 5;
    },
  },
  {
    id: "perfect_week",
    title: "Perfect Week",
    description: "Achieve an 80%+ daily health score for a week",
    icon: Trophy,
    condition: () => {
      const streak = getStreak();
      return streak >= 5;
    },
  },
];

export default function Achievements() {
  const [earned, setEarned] = useState<Set<string>>(new Set());

  useEffect(() => {
    const earnedSet = new Set<string>();
    ACHIEVEMENTS.forEach((a) => {
      if (a.condition()) earnedSet.add(a.id);
    });
    setEarned(earnedSet);
  }, []);

  return (
    <BorderGlow {...OVERVIEW_GLOW} className="w-full">
      <div className="p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-2xl bg-[#194793] text-white flex items-center justify-center font-black shadow-md shadow-[#121421]">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-black text-[#194793] [text-shadow:1.5px_1.5px_0px_#121421]">Achievements & Badges</h3>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-[#121421] text-[#194793] border border-[#727578]/40 ml-auto">
            {earned.size}/{ACHIEVEMENTS.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = earned.has(a.id);
            const Icon = a.icon;

            return (
              <div
                key={a.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? "bg-gradient-to-b from-[#194793]/20 to-[#121421] border-[#194793] shadow-md shadow-[#121421]"
                    : "bg-[#121421]/80 border-[#727578]/30 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                      isUnlocked
                        ? "bg-[#194793] text-white shadow-md shadow-[#121421]"
                        : "bg-[#727578]/20 text-zinc-500"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {!isUnlocked && <Lock className="w-4 h-4 text-zinc-500" />}
                </div>

                <div>
                  <h4
                    className={`text-sm font-heading font-black leading-snug ${
                      isUnlocked ? "text-[#194793]" : "text-zinc-400"
                    }`}
                  >
                    {a.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mt-1">
                    {a.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BorderGlow>
  );
}
