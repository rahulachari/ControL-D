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

  const triggerTestReminder = () => {
    setShowReminder(true);
    playWaterDropSound();
  };

  return (
    <>
      {/* Floating Hydration Reminder Toast */}
      {showReminder && (
        <div className="fixed bottom-6 left-6 z-[95] max-w-sm w-full bg-zinc-950/95 backdrop-blur-2xl border border-blue-500/40 rounded-3xl p-4 shadow-[0_8px_32px_rgba(59,130,246,0.3)] animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Droplet className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-heading font-extrabold text-white">💧 Hydration Reminder</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Logged: <span className="text-blue-400 font-bold">{(todayWater / 1000).toFixed(2)}L</span> / {(waterTarget / 1000).toFixed(2)}L goal
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowReminder(false)}
              className="text-zinc-500 hover:text-white p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleQuickAdd(250)}
              className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" /> +250 ml
            </button>
            <button
              onClick={() => handleQuickAdd(500)}
              className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider border border-zinc-800 transition-all"
            >
              +500 ml
            </button>
          </div>
        </div>
      )}

      {/* Subtle Hydration Trigger Pill in Footer/Floating Bar */}
      <button
        onClick={triggerTestReminder}
        title="Test Water Sound & Reminder"
        className="fixed bottom-6 left-6 z-[80] hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-900/90 hover:bg-blue-500/20 border border-zinc-800 hover:border-blue-500/50 text-xs font-bold text-zinc-400 hover:text-blue-400 backdrop-blur-xl transition-all shadow-lg"
      >
        <Droplet className="w-3.5 h-3.5 text-blue-400" />
        <span>Hydration Reminder</span>
      </button>
    </>
  );
}
