"use client";

import { useState, useEffect } from "react";
import { Droplet, X, Plus } from "lucide-react";
import { addWater, getTotalWater, getProfile } from "@/lib/healthStore";
import { playWaterDropSound } from "@/lib/audioEffects";

export default function WaterReminderToast() {
  const [showReminder, setShowReminder] = useState(false);
  const [todayWater, setTodayWater] = useState(0);
  const [waterTarget, setWaterTarget] = useState(2450);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const current = getTotalWater();
      const profile = getProfile();
      const target = profile ? Math.round(profile.weight * 35) : 2450;
      setTodayWater(current);
      setWaterTarget(target);

      // Periodically trigger hydration reminder every 45 minutes if behind schedule
      const checkHydration = () => {
        const total = getTotalWater();
        if (total < target) {
          setShowReminder(true);
          playWaterDropSound();
        }
      };

      const timer = setInterval(checkHydration, 45 * 60 * 1000);
      return () => clearInterval(timer);
    }
  }, []);

  const handleQuickAdd = (amount: number = 250) => {
    playWaterDropSound();
    const day = addWater(amount);
    const total = day.water.reduce((s, w) => s + w.amount, 0);
    setTodayWater(total);
    setShowReminder(false);
  };

  return (
    <>
      {/* Floating Hydration Reminder Toast - Cleanly floating top right on mobile/desktop without overlapping Sign Out button */}
      {showReminder && (
        <div className="fixed top-20 right-4 z-[95] max-w-sm w-[calc(100vw-32px)] sm:w-full bg-[#121421]/95 backdrop-blur-2xl border border-[#727578]/40 rounded-3xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#194793] text-white border border-[#194793] flex items-center justify-center shrink-0 shadow-md">
                <Droplet className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-heading font-extrabold text-[#194793]">💧 Hydration Reminder</h4>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Logged: <span className="text-[#194793] font-bold">{(todayWater / 1000).toFixed(2)}L</span> / {(waterTarget / 1000).toFixed(2)}L goal
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowReminder(false)}
              className="text-zinc-400 hover:text-white p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleQuickAdd(250)}
              className="flex-1 py-2.5 rounded-xl bg-[#194793] hover:bg-[#194793]/90 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-md transition-all hover:scale-105 border border-[#727578]/40"
            >
              <Plus className="w-3.5 h-3.5" /> +250 ml
            </button>
            <button
              onClick={() => handleQuickAdd(500)}
              className="flex-1 py-2.5 rounded-xl bg-[#121421] hover:bg-[#727578]/20 text-white font-black text-xs uppercase tracking-wider border border-[#727578]/40 transition-all"
            >
              +500 ml
            </button>
          </div>
        </div>
      )}
    </>
  );
}
