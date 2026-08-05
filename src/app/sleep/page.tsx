"use client";

import { useState, useEffect } from "react";
import { Moon, Star, Clock, TrendingUp, Save, Sunrise } from "lucide-react";
import { setSleep, getDayData, getWeeklyData, type SleepEntry } from "@/lib/healthStore";
import BorderGlow from "@/components/ui/BorderGlow";

const MONO_GLOW = {
  backgroundColor: "#09090b",
  glowColor: "0 0 100",
  colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
  borderRadius: 24,
};

export default function SleepPage() {
  const [bedtime, setBedtime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [quality, setQuality] = useState(3);
  const [savedSleep, setSavedSleep] = useState<SleepEntry | null>(null);
  const [weeklyData, setWeeklyData] = useState<(SleepEntry | undefined)[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const day = getDayData();
    if (day.sleep) setSavedSleep(day.sleep);
    const weekly = getWeeklyData();
    setWeeklyData(weekly.map((d) => d.sleep));
  }, []);

  const calculateHours = (bed: string, wake: string): number => {
    const [bH, bM] = bed.split(":").map(Number);
    const [wH, wM] = wake.split(":").map(Number);
    let bedMin = bH * 60 + bM;
    let wakeMin = wH * 60 + wM;
    if (wakeMin <= bedMin) wakeMin += 24 * 60;
    return parseFloat(((wakeMin - bedMin) / 60).toFixed(1));
  };

  const handleSave = () => {
    const hours = calculateHours(bedtime, wakeTime);
    const entry: SleepEntry = { bedtime, wakeTime, quality, hours };
    setSleep(entry);
    setSavedSleep(entry);
  };

  const hours = calculateHours(bedtime, wakeTime);
  const sleepScore = Math.round(
    (quality / 5) * 50 + (hours >= 7 && hours <= 9 ? 50 : hours >= 6 ? 30 : 10)
  );

  let scoreColor = "text-rose-400";
  let scoreLabel = "Poor";
  if (sleepScore >= 80) { scoreColor = "text-emerald-400"; scoreLabel = "Excellent"; }
  else if (sleepScore >= 60) { scoreColor = "text-white"; scoreLabel = "Good"; }
  else if (sleepScore >= 40) { scoreColor = "text-zinc-300"; scoreLabel = "Fair"; }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date().getDay();
  const orderedDays = [...weekDays.slice((today + 1) % 7), ...weekDays.slice(0, (today + 1) % 7)];

  if (!mounted) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-heading font-black text-white tracking-tight flex items-center gap-2">
          <Moon className="w-7 h-7 text-purple-400" /> Sleep Tracker
        </h1>
        <p className="text-sm text-zinc-400 font-medium">Log sleep and understand its impact on blood sugar.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Log Form */}
        <BorderGlow {...MONO_GLOW} className="w-full">
          <div className="p-6">
            <h3 className="text-lg font-heading font-black text-white mb-5">Log Last Night's Sleep</h3>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1 block flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-white" /> Bedtime
                  </label>
                  <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none text-sm font-bold text-white focus:border-white transition-all" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1 block flex items-center gap-1">
                    <Sunrise className="w-3.5 h-3.5 text-white" /> Wake Time
                  </label>
                  <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none text-sm font-bold text-white focus:border-white transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2 block">Sleep Quality</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((q) => (
                    <button key={q} onClick={() => setQuality(q)}
                      className={`flex-1 py-3.5 rounded-2xl text-center transition-all ${
                        quality >= q ? "bg-white text-black shadow-lg shadow-white/20" : "bg-zinc-900 border border-zinc-800 text-zinc-600 hover:text-zinc-400"
                      }`}>
                      <Star className={`w-5 h-5 mx-auto ${quality >= q ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2 px-1">
                  <span>Very Poor</span><span>Excellent</span>
                </div>
              </div>

              {/* Calculated Hours */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-sm font-bold text-zinc-300">Duration</span>
                </div>
                <span className="text-2xl font-heading font-black text-white">{hours}h</span>
              </div>

              <button onClick={handleSave}
                className="w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-white/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Sleep Log
              </button>

              {savedSleep && (
                <p className="text-xs font-bold text-emerald-400 text-center">✅ Sleep logged: {savedSleep.hours}h, {savedSleep.quality}/5 quality</p>
              )}
            </div>
          </div>
        </BorderGlow>

        {/* Score & Insights */}
        <div className="space-y-6">
          <BorderGlow {...MONO_GLOW} className="w-full">
            <div className="p-6 text-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Sleep Score</h3>
              <div className={`text-5xl font-heading font-black ${scoreColor}`}>{sleepScore}</div>
              <span className={`text-xs font-black uppercase tracking-widest ${scoreColor} block mt-1`}>{scoreLabel}</span>
              <p className="text-xs font-medium text-zinc-400 mt-4 leading-relaxed">
                {hours < 6 ? "⚠️ Less than 6 hours increases insulin resistance and raises fasting sugar." :
                 hours > 9 ? "Too much sleep can also affect metabolism. Aim for 7-8 hours." :
                 "👍 Good sleep duration. This supports healthy blood sugar levels."}
              </p>
            </div>
          </BorderGlow>

          {/* Weekly Chart */}
          <BorderGlow {...MONO_GLOW} className="w-full">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-white" />
                <h3 className="text-lg font-heading font-black text-white">This Week</h3>
              </div>
              <div className="flex items-end gap-2 h-36">
                {weeklyData.map((sleep, i) => {
                  const h = sleep?.hours || 0;
                  const barPct = h > 0 ? Math.min((h / 10) * 100, 100) : 0;
                  const isToday = i === weeklyData.length - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-zinc-400 font-bold">{h > 0 ? `${h}h` : "—"}</span>
                      <div className="w-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800" style={{ height: "90px" }}>
                        <div className={`w-full rounded-2xl transition-all duration-500 ${
                          isToday ? "bg-white shadow-lg shadow-white/20" : "bg-zinc-600"
                        }`} style={{ height: `${barPct}%`, marginTop: `${100 - barPct}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold ${isToday ? "text-white" : "text-zinc-500"}`}>{orderedDays[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </BorderGlow>

          {/* Diabetes + Sleep Insight */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-inner">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3">💡 Diabetes & Sleep</h4>
            <ul className="text-xs font-medium text-zinc-400 space-y-2">
              <li>• Poor sleep increases insulin resistance by up to 25%</li>
              <li>• Sleeping &lt;6 hours raises fasting sugar by 10-20 mg/dL</li>
              <li>• Consistent bedtime helps your body regulate hormones</li>
              <li>• Avoid screens 30 min before bed for better sleep quality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
