"use client";

import { useEffect, useState } from "react";
import { getDayData, updateGoal, getGoalCompletion, getStreak, DailyGoals as DailyGoalsType } from "@/lib/healthStore";
import { Droplet, Footprints, Pill, Salad, Activity, Dumbbell, Moon, Target, Flame, Check } from "lucide-react";
import BorderGlow from "@/components/ui/BorderGlow";

const OVERVIEW_GLOW = {
  backgroundColor: "#121421",
  glowColor: "215 71 34",
  colors: ["#194793", "#727578", "#121421"],
  borderRadius: 24,
};

const GOAL_CONFIG: { key: keyof DailyGoalsType; label: string; icon: React.ElementType }[] = [
  { key: "drinkWater", label: "Drink Water", icon: Droplet },
  { key: "walkSteps", label: "Walk 6000+ Steps", icon: Footprints },
  { key: "takeMedicines", label: "Take Medicines", icon: Pill },
  { key: "eatHealthy", label: "Eat Healthy", icon: Salad },
  { key: "logSugar", label: "Log Blood Sugar", icon: Activity },
  { key: "exercise", label: "Exercise 15+ min", icon: Dumbbell },
  { key: "sleepWell", label: "Sleep 7-8 Hours", icon: Moon },
];

export default function DailyGoals() {
  const [goals, setGoals] = useState<DailyGoalsType>({
    drinkWater: false, walkSteps: false, takeMedicines: false,
    eatHealthy: false, logSugar: false, exercise: false, sleepWell: false,
  });
  const [completion, setCompletion] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const day = getDayData();
    setGoals(day.goals);
    setCompletion(getGoalCompletion());
    setStreak(getStreak());
  }, []);

  const toggleGoal = (key: keyof DailyGoalsType) => {
    const newValue = !goals[key];
    const updated = updateGoal(key, newValue);
    setGoals(updated.goals);
    setCompletion(getGoalCompletion());
  };

  return (
    <BorderGlow {...OVERVIEW_GLOW} className="w-full card-3d-hover">
      <div className="p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#194793] text-white flex items-center justify-center font-black shadow-md shadow-[#121421]">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-heading font-black text-[#194793] [text-shadow:1.5px_1.5px_0px_#121421]">Daily Goals & Habits</h3>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#121421] text-[#194793] border border-[#727578]/40 text-xs font-black">
                <Flame className="w-3.5 h-3.5 text-[#194793]" /> {streak}-Day Streak
              </span>
            )}
            <span className="text-xs font-black px-3 py-1 rounded-full bg-[#194793] text-white shadow-md shadow-[#121421]">
              {completion}% Done
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 rounded-full bg-[#121421] mb-6 overflow-hidden border border-[#727578]/40">
          <div
            className="h-full rounded-full bg-[#194793] transition-all duration-700 shadow-md shadow-[#194793]/50"
            style={{ width: `${completion}%` }}
          />
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {GOAL_CONFIG.map(({ key, label, icon: Icon }) => {
            const isDone = goals[key];
            return (
              <button
                key={key}
                onClick={() => toggleGoal(key)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center gap-2 cursor-pointer ${
                  isDone
                    ? "bg-[#194793] border-[#194793] text-white shadow-lg shadow-[#121421] scale-105"
                    : "bg-[#121421] border-[#727578]/40 text-zinc-300 hover:border-[#194793] hover:text-[#194793]"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                  isDone ? "bg-white text-[#194793]" : "bg-[#727578]/20 text-[#194793]"
                }`}>
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-xs font-bold leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </BorderGlow>
  );
}
