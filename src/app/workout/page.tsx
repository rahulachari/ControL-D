"use client";

import { useState, useEffect, useRef } from "react";
import { Dumbbell, Play, Pause, RotateCcw, CheckCircle, Timer, Flame, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { addWorkout, getProfile, getDayData } from "@/lib/healthStore";
import BorderGlow from "@/components/ui/BorderGlow";

const MONO_GLOW = {
  backgroundColor: "#09090b",
  glowColor: "0 0 100",
  colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
  borderRadius: 24,
};

interface Exercise {
  name: string;
  category: string;
  duration: number; // minutes
  calories: number;
  difficulty: "Easy" | "Moderate" | "Hard";
  icon: string;
  steps: string[];
  benefits: string;
  diabeticNote: string;
}

const DAILY_ROUTINES: { day: string; focus: string; exercises: Exercise[] }[] = [
  {
    day: "Monday", focus: "Walking & Stretching",
    exercises: [
      { name: "Brisk Walk", category: "Cardio", duration: 20, calories: 80, difficulty: "Easy", icon: "🚶",
        steps: ["Start with a slow 2-minute warm-up walk", "Gradually increase speed to brisk pace", "Swing arms naturally", "Maintain for 15 minutes", "Cool down with 3-minute slow walk"],
        benefits: "Improves insulin sensitivity, lowers blood sugar for up to 24 hours",
        diabeticNote: "Post-meal walks (15-20 min) can reduce sugar spikes by 20-30%" },
      { name: "Standing Hamstring Stretch", category: "Flexibility", duration: 5, calories: 15, difficulty: "Easy", icon: "🧘",
        steps: ["Stand tall, feet hip-width apart", "Extend right leg forward, heel on ground", "Hinge at hips, hands on thighs", "Hold 20 seconds, feel stretch in back of leg", "Switch legs, repeat 3 times each"],
        benefits: "Improves flexibility, reduces stiffness, aids blood circulation",
        diabeticNote: "Better circulation helps prevent diabetic neuropathy" },
      { name: "Deep Breathing", category: "Relaxation", duration: 5, calories: 5, difficulty: "Easy", icon: "🌬️",
        steps: ["Sit comfortably, close eyes", "Inhale slowly through nose for 4 counts", "Hold for 4 counts", "Exhale slowly through mouth for 6 counts", "Repeat 10 cycles"],
        benefits: "Reduces cortisol (stress hormone), which can spike blood sugar",
        diabeticNote: "Stress directly raises blood sugar. Daily breathing exercises help control it." },
    ],
  },
  {
    day: "Tuesday", focus: "Light Strength Training",
    exercises: [
      { name: "Wall Push-ups", category: "Strength", duration: 5, calories: 25, difficulty: "Easy", icon: "💪",
        steps: ["Stand arm's length from wall", "Place palms on wall, shoulder-width apart", "Bend elbows, lean toward wall", "Push back to starting position", "Do 3 sets of 10 reps"],
        benefits: "Builds upper body strength without strain on joints",
        diabeticNote: "Muscle building improves glucose uptake from blood" },
      { name: "Chair Squats", category: "Strength", duration: 5, calories: 30, difficulty: "Easy", icon: "🪑",
        steps: ["Stand in front of a chair", "Lower yourself as if sitting down", "Touch the chair lightly, then stand back up", "Keep knees behind toes", "Do 3 sets of 10 reps"],
        benefits: "Strengthens legs and core, improves balance",
        diabeticNote: "Leg muscles are the largest glucose consumers in your body" },
      { name: "Calf Raises", category: "Strength", duration: 3, calories: 15, difficulty: "Easy", icon: "🦶",
        steps: ["Stand near a wall for balance", "Rise up on your toes", "Hold for 2 seconds at the top", "Lower slowly", "Do 3 sets of 15 reps"],
        benefits: "Improves circulation in lower legs, strengthens calves",
        diabeticNote: "Better foot circulation helps prevent diabetic foot complications" },
    ],
  },
  {
    day: "Wednesday", focus: "Yoga for Blood Sugar",
    exercises: [
      { name: "Surya Namaskar", category: "Yoga", duration: 10, calories: 50, difficulty: "Moderate", icon: "🧘‍♂️",
        steps: ["Start in prayer pose (Pranamasana)", "Raise arms overhead (Hasta Uttanasana)", "Forward bend (Uttanasana)", "Step back to plank", "Lower knees-chest-chin", "Cobra pose (Bhujangasana)", "Reverse to standing"],
        benefits: "Full body workout, stimulates pancreas, improves metabolism",
        diabeticNote: "Studies show regular Surya Namaskar can reduce fasting sugar by 10-15 mg/dL" },
      { name: "Vajrasana", category: "Yoga", duration: 5, calories: 10, difficulty: "Easy", icon: "🧘",
        steps: ["Kneel on the floor, sit on your heels", "Keep spine straight, hands on thighs", "Close eyes, breathe deeply", "Hold for 5 minutes", "Excellent after meals for digestion"],
        benefits: "Improves digestion, reduces post-meal sugar spikes",
        diabeticNote: "Only yoga pose recommended immediately after eating" },
    ],
  },
  {
    day: "Thursday", focus: "Cardio & Core",
    exercises: [
      { name: "Spot Marching", category: "Cardio", duration: 10, calories: 50, difficulty: "Easy", icon: "🏃",
        steps: ["Stand tall, feet together", "March in place, lifting knees high", "Swing arms naturally", "Maintain steady pace", "Continue for 10 minutes"],
        benefits: "Gentle cardio that can be done indoors, improves heart health",
        diabeticNote: "Even light marching for 10 min after meals helps glucose control" },
      { name: "Seated Core Twist", category: "Core", duration: 5, calories: 20, difficulty: "Easy", icon: "🔄",
        steps: ["Sit in a chair, feet flat on floor", "Cross arms over chest", "Twist torso to the right, hold 5 seconds", "Return to center", "Twist to left, hold 5 seconds", "Do 10 reps each side"],
        benefits: "Strengthens core, stimulates abdominal organs including pancreas",
        diabeticNote: "Twisting poses massage internal organs and improve insulin function" },
    ],
  },
  {
    day: "Friday", focus: "Resistance Band Training",
    exercises: [
      { name: "Bicep Curls (Band)", category: "Strength", duration: 5, calories: 25, difficulty: "Moderate", icon: "💪",
        steps: ["Stand on resistance band, feet shoulder-width", "Hold handles with palms facing up", "Curl hands toward shoulders", "Lower slowly with control", "Do 3 sets of 12 reps"],
        benefits: "Builds arm strength, increases muscle mass for better glucose metabolism",
        diabeticNote: "Resistance training is as important as cardio for diabetes management" },
      { name: "Band Pull-Apart", category: "Strength", duration: 5, calories: 20, difficulty: "Easy", icon: "🎗️",
        steps: ["Hold band at chest height, arms extended", "Pull band apart by squeezing shoulder blades", "Hold for 2 seconds", "Return slowly", "Do 3 sets of 15 reps"],
        benefits: "Strengthens upper back, improves posture",
        diabeticNote: "Good posture improves breathing and oxygen flow, aiding metabolism" },
    ],
  },
  {
    day: "Saturday", focus: "Active Recovery & Mobility",
    exercises: [
      { name: "Gentle Walk", category: "Cardio", duration: 15, calories: 60, difficulty: "Easy", icon: "🌿",
        steps: ["Walk at a comfortable, relaxed pace", "Focus on enjoying your surroundings", "Practice deep breathing while walking", "Include gentle arm circles", "15 minutes total"],
        benefits: "Active recovery maintains blood flow without straining muscles",
        diabeticNote: "Even gentle walking maintains improved insulin sensitivity" },
      { name: "Neck & Shoulder Rolls", category: "Mobility", duration: 5, calories: 10, difficulty: "Easy", icon: "🔵",
        steps: ["Roll shoulders forward 10 times", "Roll shoulders backward 10 times", "Tilt head left, hold 15 seconds", "Tilt head right, hold 15 seconds", "Gentle neck circles, 5 each direction"],
        benefits: "Releases tension, improves range of motion",
        diabeticNote: "Stress tension raises cortisol. Releasing it helps blood sugar control." },
    ],
  },
  {
    day: "Sunday", focus: "Rest & Breathing",
    exercises: [
      { name: "Pranayama", category: "Breathing", duration: 10, calories: 15, difficulty: "Easy", icon: "🌬️",
        steps: ["Sit comfortably in cross-legged position", "Close right nostril with thumb", "Inhale through left nostril for 4 counts", "Close left nostril, open right", "Exhale through right for 6 counts", "Inhale right, exhale left", "Continue for 10 minutes"],
        benefits: "Calms nervous system, reduces blood pressure, improves oxygenation",
        diabeticNote: "Regular pranayama has been shown to improve HbA1c levels over 3 months" },
      { name: "Shavasana", category: "Relaxation", duration: 10, calories: 5, difficulty: "Easy", icon: "😌",
        steps: ["Lie flat on your back", "Arms at sides, palms up", "Close eyes, relax every muscle", "Focus on slow, deep breathing", "Stay for 10 minutes, don't fall asleep"],
        benefits: "Deep relaxation, stress relief, mental clarity",
        diabeticNote: "Reduces cortisol dramatically. End every workout with this for best results." },
    ],
  },
];

export default function WorkoutPage() {
  const [todayRoutine, setTodayRoutine] = useState(DAILY_ROUTINES[0]);
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
    const mapped = dayIndex === 0 ? 6 : dayIndex - 1;
    setTodayRoutine(DAILY_ROUTINES[mapped]);
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const startExercise = (idx: number) => {
    setActiveExercise(idx);
    setTimer(0);
    setIsTimerRunning(true);
  };

  const completeExercise = (idx: number) => {
    setIsTimerRunning(false);
    const ex = todayRoutine.exercises[idx];
    addWorkout({
      name: ex.name,
      duration: Math.max(Math.round(timer / 60), 1),
      calories: ex.calories,
      type: ex.category,
      completedAt: new Date().toISOString(),
    });
    setCompletedExercises((prev) => new Set([...prev, idx]));
    setActiveExercise(null);
    setTimer(0);
  };

  const totalDuration = todayRoutine.exercises.reduce((s, e) => s + e.duration, 0);
  const totalCalories = todayRoutine.exercises.reduce((s, e) => s + e.calories, 0);
  const completedCount = completedExercises.size;

  if (!mounted) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-heading font-black text-white tracking-tight flex items-center gap-2">
          <Dumbbell className="w-7 h-7 text-amber-400" /> AI Fitness Coach
        </h1>
        <p className="text-sm text-zinc-400 font-medium">Diabetes-safe exercises tailored to your daily routine.</p>
      </div>

      {/* Today's Focus */}
      <BorderGlow {...MONO_GLOW} className="w-full">
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-white/20">
            🏋️
          </div>
          <div className="flex-1">
            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{todayRoutine.day}'s Focus</span>
            <h2 className="text-xl font-heading font-black text-white mt-1">{todayRoutine.focus}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <span className="flex items-center gap-1 text-white"><Timer className="w-3.5 h-3.5 text-zinc-500" /> {totalDuration} min</span>
              <span className="flex items-center gap-1 text-white"><Flame className="w-3.5 h-3.5 text-zinc-500" /> {totalCalories} cal</span>
              <span className="flex items-center gap-1 text-white"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {completedCount}/{todayRoutine.exercises.length} done</span>
            </div>
          </div>
        </div>
      </BorderGlow>

      {/* Exercises */}
      <div className="space-y-4">
        {todayRoutine.exercises.map((ex, idx) => {
          const isActive = activeExercise === idx;
          const isCompleted = completedExercises.has(idx);
          const isExpanded = expandedExercise === idx;

          return (
            <BorderGlow key={idx} {...MONO_GLOW} className="w-full transition-all">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border ${
                    isCompleted ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20" : "bg-zinc-900 border-zinc-800"
                  }`}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : ex.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-heading font-black ${isCompleted ? "text-zinc-500 line-through" : "text-white"}`}>
                      {ex.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">
                      <span className="bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800 text-white">{ex.category}</span>
                      <span className="bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800 text-white">{ex.duration} min</span>
                      <span className="bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800 text-white">{ex.calories} cal</span>
                      <span className={`px-2 py-1 rounded-md border ${
                        ex.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                        ex.difficulty === "Moderate" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
                        "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {ex.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-zinc-800 sm:border-0 justify-between sm:justify-end">
                    {isActive && (
                      <span className="text-xl font-mono font-black text-white px-2">{formatTime(timer)}</span>
                    )}
                    
                    {!isCompleted && !isActive && (
                      <button onClick={() => startExercise(idx)} className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-black shadow-lg shadow-white/20 hover:scale-105 transition-all w-full sm:w-auto text-center">
                        <Play className="w-3.5 h-3.5 inline mr-1" /> Start
                      </button>
                    )}

                    {isActive && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-3 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors">
                          {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button onClick={() => completeExercise(idx)} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-500/20 w-full sm:w-auto">
                          <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Done
                        </button>
                      </div>
                    )}

                    <button onClick={() => setExpandedExercise(isExpanded ? null : idx)} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-zinc-800 space-y-4">
                    <div>
                      <span className="text-xs font-black text-white uppercase tracking-widest block mb-2">Steps:</span>
                      <ol className="mt-1 space-y-2">
                        {ex.steps.map((step, si) => (
                          <li key={si} className="text-sm font-medium text-zinc-400 flex gap-3">
                            <span className="text-zinc-600 font-black shrink-0">{si + 1}.</span> {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                      <p className="text-sm text-zinc-300 font-medium mb-3"><strong className="text-white font-black uppercase tracking-widest text-xs block mb-1">Benefits:</strong> {ex.benefits}</p>
                      <p className="text-sm text-emerald-400 font-medium">
                        <Heart className="w-4 h-4 inline mr-1" /> <strong className="text-emerald-500 font-black">DIABETIC BENEFIT:</strong> {ex.diabeticNote}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </BorderGlow>
          );
        })}
      </div>
    </div>
  );
}
