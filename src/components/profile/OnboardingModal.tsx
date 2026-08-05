"use client";

import { useState, useEffect } from "react";
import { User, Activity, Heart, Shield, Check, Scale, Ruler, Calendar } from "lucide-react";
import BorderGlow from "@/components/ui/BorderGlow";

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: string;
  activityLevel: string;
  diabetesType: string;
  targetWater?: number;
  targetCalories?: number;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

const MONO_GLOW = {
  backgroundColor: "#09090b",
  glowColor: "0 0 100",
  colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
  borderRadius: 24,
};

export default function OnboardingModal({ isOpen, onClose, onSave }: OnboardingModalProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">(28);
  const [weight, setWeight] = useState<number | "">(70);
  const [height, setHeight] = useState<number | "">(175);
  const [gender, setGender] = useState("male");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [diabetesType, setDiabetesType] = useState("type2");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userProfile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          if (parsed.name) setName(parsed.name);
          if (parsed.age) setAge(parsed.age);
          if (parsed.weight) setWeight(parsed.weight);
          if (parsed.height) setHeight(parsed.height);
          if (parsed.gender) setGender(parsed.gender);
          if (parsed.activityLevel) setActivityLevel(parsed.activityLevel);
          if (parsed.diabetesType) setDiabetesType(parsed.diabetesType);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAge = typeof age === "number" ? age : 28;
    const parsedWeight = typeof weight === "number" ? weight : 70;
    const parsedHeight = typeof height === "number" ? height : 175;

    // Calculate baseline water intake (35ml per kg)
    const calculatedWater = Math.round(parsedWeight * 35);
    // Baseline BMR calculation
    const bmr = 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge + (gender === "male" ? 5 : -161);
    const calculatedCalories = Math.round(bmr * 1.375);

    const profile: UserProfile = {
      name: name.trim() || "User",
      age: parsedAge,
      weight: parsedWeight,
      height: parsedHeight,
      gender,
      activityLevel,
      diabetesType,
      targetWater: calculatedWater,
      targetCalories: calculatedCalories,
    };

    localStorage.setItem("userProfile", JSON.stringify(profile));
    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <BorderGlow {...MONO_GLOW} className="w-full">
          <div className="p-6 md:p-8">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <Heart className="w-7 h-7 animate-pulse text-black" />
              </div>
              <h2 className="text-2xl font-heading font-black text-white">
                Set Up Your Health Profile
              </h2>
              <p className="text-sm text-zinc-400 mt-1 font-medium">
                Personalize ControL-D to tailor your metrics, workouts, and reminders.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-white focus:ring-1 focus:ring-white outline-none text-white text-sm transition-all"
                  />
                </div>
              </div>

              {/* Age, Weight, Height Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Age
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="number"
                      min={10}
                      max={120}
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full pl-9 pr-2 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-white focus:ring-1 focus:ring-white outline-none text-white text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Weight (kg)
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="number"
                      min={30}
                      max={250}
                      required
                      value={weight}
                      onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full pl-9 pr-2 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-white focus:ring-1 focus:ring-white outline-none text-white text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Height (cm)
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="number"
                      min={100}
                      max={230}
                      required
                      value={height}
                      onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full pl-9 pr-2 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-white focus:ring-1 focus:ring-white outline-none text-white text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Gender & Activity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-white focus:ring-1 focus:ring-white outline-none text-white text-sm transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Diabetes / Condition
                  </label>
                  <select
                    value={diabetesType}
                    onChange={(e) => setDiabetesType(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-white focus:ring-1 focus:ring-white outline-none text-white text-sm transition-all"
                  >
                    <option value="type1">Type 1 Diabetes</option>
                    <option value="type2">Type 2 Diabetes</option>
                    <option value="prediabetes">Prediabetes</option>
                    <option value="general_health">General Wellness</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-white hover:scale-[1.02] active:scale-[0.98] text-black font-black text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5 text-black" /> Save Health Profile
                </button>
              </div>
            </form>
          </div>
        </BorderGlow>
      </div>
    </div>
  );
}
