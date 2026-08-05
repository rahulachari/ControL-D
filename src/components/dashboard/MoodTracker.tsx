"use client";

import { useEffect, useState } from "react";
import { setMood as saveMood, getDayData, MoodEntry } from "@/lib/healthStore";
import { SmilePlus } from "lucide-react";
import BorderGlow from "@/components/ui/BorderGlow";

const MONO_GLOW = {
  backgroundColor: "#09090b",
  glowColor: "0 0 100",
  colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
  borderRadius: 24,
};

const MOODS: { value: MoodEntry["mood"]; emoji: string; label: string }[] = [
  { value: "happy", emoji: "😊", label: "Happy" },
  { value: "normal", emoji: "😐", label: "Normal" },
  { value: "tired", emoji: "😴", label: "Tired" },
  { value: "anxious", emoji: "😰", label: "Anxious" },
  { value: "stressed", emoji: "😣", label: "Stressed" },
  { value: "sad", emoji: "😢", label: "Sad" },
];

export default function MoodTracker() {
  const [currentMood, setCurrentMood] = useState<MoodEntry["mood"] | null>(null);

  useEffect(() => {
    const day = getDayData();
    if (day.mood) setCurrentMood(day.mood.mood);
  }, []);

  const handleMood = (mood: MoodEntry["mood"]) => {
    saveMood(mood);
    setCurrentMood(mood);
  };

  return (
    <BorderGlow {...MONO_GLOW} className="w-full">
      <div className="p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-2xl bg-white text-black flex items-center justify-center font-bold">
            <SmilePlus className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-extrabold text-white">How are you feeling today?</h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => handleMood(m.value)}
              className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-2xl border transition-all duration-200 ${
                currentMood === m.value
                  ? "bg-white border-white text-black shadow-lg shadow-white/20 scale-105"
                  : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                {m.label}
              </span>
            </button>
          ))}
        </div>

        {currentMood && (
          <p className="text-xs text-zinc-400 mt-4 text-center font-medium">
            Mood logged for today. Correlates emotional wellness with glucose stability and sleep scores.
          </p>
        )}
      </div>
    </BorderGlow>
  );
}
