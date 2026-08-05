"use client";

import { useEffect, useState } from "react";
import { getStreak, getWeeklyData } from "@/lib/healthStore";
import { Trophy, Flame, Droplet, Pill, Salad, Dumbbell, Heart, Crown, Lock } from "lucide-react";
import BorderGlow from "@/components/ui/BorderGlow";

const MONO_GLOW = {
  backgroundColor: "#09090b",
  glowColor: "0 0 100",
  colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
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
    description: "Log healthy meals for 5 days this week",
    icon: Salad,
    condition: () => {
      const week = getWeeklyData();
      return week.filter((d) => d.meals.length >= 2).length >= 5;
    },
  },
  {
    id: "fitness_hero",
    title: "Fitness Hero",
    description: "Exercise 5 days this week",
    icon: Dumbbell,
    condition: () => {
      const week = getWeeklyData();
      return week.filter((d) => d.goals.exercise).length >= 5;
    },
  },
  {
    id: "sugar_stable",
    title: "Stable Sugar",
    description: "Keep readings in range for 5 consecutive days",
    icon: Heart,
    condition: () => {
      const week = getWeeklyData();
      let streak = 0;
      for (const d of week) {
        const allInRange = d.sugar.length > 0 && d.sugar.every((s) => s.value >= 70 && s.value <= 180);
        if (allInRange) streak++;
        else streak = 0;
      }
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
    <BorderGlow {...MONO_GLOW} className="w-full">
      <div className="p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-2xl bg-white text-black flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-extrabold text-white">Achievements</h3>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-zinc-900 text-white border border-zinc-800 ml-auto">
            {earned.size}/{ACHIEVEMENTS.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const isEarned = earned.has(a.id);
            const Icon = a.icon;
            return (
              <div
                key={a.id}
                className={`relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 ${
                  isEarned
                    ? "bg-zinc-900 border-zinc-700 shadow-lg text-white"
                    : "bg-zinc-900/30 border-zinc-800/40 opacity-40 grayscale"
                }`}
              >
                {!isEarned && (
                  <Lock className="absolute top-2.5 right-2.5 w-3.5 h-3.5 text-zinc-500" />
                )}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2.5 ${
                  isEarned ? "bg-white text-black" : "bg-zinc-800 text-zinc-500"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-extrabold ${isEarned ? "text-white" : "text-zinc-400"}`}>
                  {a.title}
                </span>
                <span className="text-[10px] text-zinc-400 mt-1 leading-tight font-medium">{a.description}</span>
              </div>
            );
          })}
        </div>
      </div>
    </BorderGlow>
  );
}
