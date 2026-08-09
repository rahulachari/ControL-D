"use client";

import { useEffect, useState } from "react";
import { calculateHealthScore } from "@/lib/healthStore";
import { ShieldCheck } from "lucide-react";
import BorderGlow from "@/components/ui/BorderGlow";

const OVERVIEW_GLOW = {
  backgroundColor: "#121421",
  glowColor: "215 71 34",
  colors: ["#194793", "#727578", "#121421"],
  borderRadius: 24,
};

export default function HealthScoreCard() {
  const [score, setScore] = useState(0);
  const [grade, setGrade] = useState("—");
  const [color, setColor] = useState("text-zinc-400");
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const result = calculateHealthScore();
    setScore(result.score);
    setGrade(result.grade);
    setColor(result.color);
  }, []);

  useEffect(() => {
    if (score === 0) return;
    let current = 0;
    const step = Math.ceil(score / 40);
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setAnimatedScore(current);
    }, 30);
    return () => clearInterval(interval);
  }, [score]);

  const circumference = 2 * Math.PI * 52;

  return (
    <BorderGlow {...OVERVIEW_GLOW} className="w-full h-full card-3d-hover">
      <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden h-full bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30">
        <div className="absolute top-4 right-4">
          <ShieldCheck className="w-5 h-5 text-[#194793]" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest text-[#194793] mb-3">Health Score</span>

        {/* Animated Score Ring */}
        <div className="relative w-28 h-28 my-1 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-[#727578]/30" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              strokeWidth="8" strokeLinecap="round"
              stroke="#194793"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (animatedScore / 100) * circumference}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-heading font-black text-[#194793] [text-shadow:1.5px_1.5px_0px_#121421]">{animatedScore}</span>
            <span className="text-[10px] font-black text-zinc-400 uppercase">/ 100</span>
          </div>
        </div>

        <div className="mt-2">
          <span className="text-xs font-black uppercase tracking-wider text-white bg-[#121421] px-3 py-1 rounded-full border border-[#727578]/40">
            Grade: <span className="text-[#194793] font-black">{grade}</span>
          </span>
        </div>
      </div>
    </BorderGlow>
  );
}
