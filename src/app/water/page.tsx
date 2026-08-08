"use client";

import WaterTracker from "@/components/dashboard/WaterTracker";
import { Droplet, Sparkles } from "lucide-react";

export default function WaterPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-28 sm:pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121421] border border-[#727578]/40 text-[#194793] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Personalized Hydration
          </div>
          <h1 className="text-3xl font-heading font-black text-[#194793] tracking-tight [text-shadow:2px_2px_0px_#121421] flex items-center gap-2">
            <Droplet className="w-7 h-7 text-[#194793]" /> Water Tracking
          </h1>
          <p className="text-zinc-300 text-sm mt-1 font-medium">Monitor and meet your daily hydration goal based on your body weight.</p>
        </div>
      </div>
      <WaterTracker />
    </div>
  );
}
