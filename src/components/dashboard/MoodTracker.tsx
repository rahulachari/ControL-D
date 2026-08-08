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
    <BorderGlow {...OVERVIEW_GLOW} className="w-full">
      <div className="p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-2xl bg-[#194793] text-white flex items-center justify-center font-black shadow-md shadow-[#121421]">
            <SmilePlus className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-black text-[#194793] [text-shadow:1.5px_1.5px_0px_#121421]">How are you feeling today?</h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => handleMood(m.value)}
              className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                currentMood === m.value
                  ? "bg-[#194793] border-[#194793] text-white shadow-lg shadow-[#121421] scale-105"
                  : "border-[#727578]/40 bg-[#121421] text-zinc-300 hover:border-[#194793] hover:text-[#194793]"
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] font-black uppercase tracking-wider">
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </BorderGlow>
  );
}
