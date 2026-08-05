"use client";

import { useEffect, useState } from "react";
import { calculateHealthScore } from "@/lib/healthStore";
import { ShieldCheck } from "lucide-react";
import BorderGlow from "@/components/ui/BorderGlow";

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
  const dashOffset = circumference - (animatedScore / 100) * circumference;

  return (
    <BorderGlow
      borderRadius={24}
      glowColor="0 0 100"
      backgroundColor="#09090b"
      colors={["#ffffff", "#a1a1aa", "#71717a"]}
      className="w-full h-full"
    >
      <div className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden h-full">
        <div className="absolute top-4 right-4">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>

        {/* Animated Score Ring */}
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-800" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              strokeWidth="8" strokeLinecap="round"
              stroke="url(#scoreGrad)"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#a1a1aa" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-heading font-extrabold text-white">
              {animatedScore}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold">/ 100</span>
          </div>
        </div>

        <div className="text-sm font-heading font-extrabold text-white">{grade}</div>
        <p className="text-[11px] text-zinc-400 mt-1 font-bold">Today's Health Score</p>
      </div>
    </BorderGlow>
  );
}
