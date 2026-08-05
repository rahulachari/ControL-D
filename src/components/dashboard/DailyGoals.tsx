"use client";

import { useEffect, useState } from "react";
import { getDayData, updateGoal, getGoalCompletion, getStreak, DailyGoals as DailyGoalsType } from "@/lib/healthStore";
import { Droplet, Footprints, Pill, Salad, Activity, Dumbbell, Moon, Target, Flame } from "lucide-react";
import BorderGlow from "@/components/ui/BorderGlow";

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
    <BorderGlow
      borderRadius={24}
      glowColor="0 0 100"
      backgroundColor="#09090b"
      colors={["#ffffff", "#a1a1aa", "#71717a"]}
      className="w-full"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-white text-black flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-heading font-extrabold text-white">Daily Goals</h3>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 text-white border border-zinc-800 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-white" /> {streak}-Day Streak
              </span>
            )}
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white text-black">
              {completion}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 rounded-full bg-zinc-900 mb-5 overflow-hidden border border-zinc-800">
          <div
            className="h-full rounded-full bg-white transition-all duration-700 ease-out shadow-md shadow-white/30"
            style={{ width: `${completion}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {GOAL_CONFIG.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => toggleGoal(key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-full text-left transition-all duration-200 border ${
                goals[key]
                  ? "bg-white border-white text-black shadow-lg shadow-white/20 font-extrabold"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                goals[key]
                  ? "bg-black text-white"
                  : "bg-zinc-800 text-zinc-300"
              }`}>
                {goals[key] ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className={`text-sm font-bold ${
                goals[key] ? "text-black line-through" : "text-zinc-200"
              }`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </BorderGlow>
  );
}
