"use client";

import { useEffect, useState } from "react";
import { setMood as saveMood, getDayData, MoodEntry } from "@/lib/healthStore";
import { SmilePlus } from "lucide-react";
import BorderGlow from "@/components/ui/BorderGlow";

const OVERVIEW_GLOW = {
  backgroundColor: "#121421",
  glowColor: "215 71 34",
  colors: ["#194793", "#727578", "#121421"],
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
    <BorderGlow {...OVERVIEW_GLOW} className="w-full card-3d-hover">
      <div className="p-4 sm:p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-2xl bg-[#194793] text-white flex items-center justify-center font-black shadow-md shadow-[#121421]">
            <SmilePlus className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-black text-[#194793] [text-shadow:1.5px_1.5px_0px_#121421]">How are you feeling today?</h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {MOODS.map((m) => {
            const isSelected = currentMood === m.value;
            return (
              <button
                key={m.value}
                onClick={() => handleMood(m.value)}
                className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center transition-all border ${
                  isSelected 
                    ? "bg-[#194793] border-[#194793] shadow-md shadow-[#121421] scale-105" 
                    : "bg-[#121421] border-[#727578]/40 hover:border-[#194793] hover:bg-[#194793]/50"
                }`}
              >
                <span className="text-2xl sm:text-3xl mb-1 icon-3d-hover inline-block">{m.emoji}</span>
                <span className={`text-[10px] sm:text-xs font-black ${isSelected ? "text-white" : "text-zinc-400"}`}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </BorderGlow>
  );
}
