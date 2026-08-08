"use client";

import { useState, useEffect } from "react";
import { Dumbbell, Play, Pause, CheckCircle, Timer, Flame, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { addWorkout, getProfile, getDayData } from "@/lib/healthStore";
import BorderGlow from "@/components/ui/BorderGlow";

const OVERVIEW_GLOW = {
  backgroundColor: "#121421",
  glowColor: "215 71 34",
  colors: ["#194793", "#727578", "#121421"],
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

interface Routine {
  day: string;
  focus: string;
  exercises: Exercise[];
}

const WEEKLY_ROUTINES: Routine[] = [
  {
    day: "Monday", focus: "Post-Meal Glucose Control Walk & Stretches",
    exercises: [
      { name: "Brisk Post-Meal Walk", category: "Cardio", duration: 15, calories: 75, difficulty: "Easy", icon: "🚶‍♂️",
        steps: ["Walk at a brisk pace (about 4-5 km/h)", "Keep posture upright, swing arms naturally", "Breathe deeply through nose", "Aim for 15-20 min starting 20 min after lunch/dinner"],
        benefits: "Directly lowers post-prandial blood sugar spikes by increasing muscle glucose uptake",
        diabeticNote: "Walking within 30 min of eating is 2x more effective at lowering glucose spikes than morning exercise." },
      { name: "Standing Calf Raises", category: "Lower Body", duration: 5, calories: 25, difficulty: "Easy", icon: "🦵",
        steps: ["Stand near a wall for balance", "Raise heels slowly, standing on toes", "Hold for 2 seconds at the top", "Lower heels back down", "Do 3 sets of 15 reps"],
        benefits: "Activates soleus muscle — a major regulator of blood glucose & lipid metabolism",
        diabeticNote: "Soleus muscle contractions use blood glucose without requiring high insulin." },
    ],
  },
  {
    day: "Tuesday", focus: "Gentle Upper Body & Pancreas Stimulation",
    exercises: [
      { name: "Chair Squats", category: "Strength", duration: 10, calories: 50, difficulty: "Moderate", icon: "🪑",
        steps: ["Stand in front of a sturdy chair", "Lower hips as if sitting down until lightly touching chair", "Pause for 1 second", "Push through heels to stand up", "Do 3 sets of 10-12 reps"],
        benefits: "Engages quadriceps & glutes — largest muscle groups that absorb blood glucose",
        diabeticNote: "Building leg muscle mass increases baseline insulin sensitivity long-term." },
      { name: "Wall Push-Ups", category: "Upper Body", duration: 5, calories: 30, difficulty: "Easy", icon: "🧱",
        steps: ["Face a wall at arm's length", "Place palms flat on wall at shoulder height", "Bend elbows to bring chest toward wall", "Push back to starting position", "Do 3 sets of 12 reps"],
        benefits: "Builds upper body strength safely without joint strain",
        diabeticNote: "Resistance exercise helps clear glucose from circulation faster." },
    ],
  },
  {
    day: "Wednesday", focus: "Yoga & Diaphragmatic Breathing for Cortisol Control",
    exercises: [
      { name: "Bhujangasana (Cobra Pose)", category: "Yoga", duration: 5, calories: 20, difficulty: "Easy", icon: "🐍",
        steps: ["Lie on stomach, hands under shoulders", "Inhale and gently lift chest up", "Keep elbows slightly bent, look forward", "Hold for 15-30 seconds", "Repeat 4-5 times"],
        benefits: "Gently compresses abdominal organs, stimulating pancreas and improving digestion",
        diabeticNote: "Abdominal stretch improves blood flow to abdominal organs including pancreas." },
      { name: "Diaphragmatic Deep Breathing", category: "Yoga", duration: 10, calories: 15, difficulty: "Easy", icon: "🧘‍♂️",
        steps: ["Sit in a comfortable chair or cross-legged", "Place one hand on chest, one on belly", "Inhale deeply through nose for 4s (belly rises)", "Hold for 2s", "Exhale through mouth for 6s (belly falls)", "Continue for 10 minutes"],
        benefits: "Activates parasympathetic nervous system, lowering stress hormones (cortisol & adrenaline)",
        diabeticNote: "High cortisol causes liver to dump glucose into blood. Deep breathing directly lowers blood sugar." },
    ],
  },
  {
    day: "Thursday", focus: "Light Cardio & Balance",
    exercises: [
      { name: "Marching in Place", category: "Cardio", duration: 10, calories: 45, difficulty: "Easy", icon: "🏃‍♂️",
        steps: ["Stand tall, lift knees up to hip height alternately", "Pump arms opposite to legs", "Keep a steady rhythm", "Do 2-minute bouts with 30s rest, 5 times"],
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
    ],
  },
];

export default function WorkoutPage() {
  const [todayRoutine, setTodayRoutine] = useState<Routine>(WEEKLY_ROUTINES[0]);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dayOfWeek = new Date().getDay(); // 0 = Sun, 1 = Mon...
    const routineIndex = (dayOfWeek + 6) % 7; // Map 1 (Mon) -> 0, 0 (Sun) -> 6
    setTodayRoutine(WEEKLY_ROUTINES[routineIndex]);

    const dayData = getDayData();
    const completedNames = new Set(dayData.workouts.map((w) => w.name));
    const completedIndices = new Set<number>();
    WEEKLY_ROUTINES[routineIndex].exercises.forEach((ex, idx) => {
      if (completedNames.has(ex.name)) completedIndices.add(idx);
    });
    setCompletedExercises(completedIndices);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#194793] border-t-transparent" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-28 sm:pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-heading font-black text-[#194793] tracking-tight [text-shadow:2px_2px_0px_#121421] flex items-center gap-2">
          <Dumbbell className="w-7 h-7 text-[#194793]" /> AI Fitness Coach
        </h1>
        <p className="text-sm text-zinc-300 font-medium">Diabetes-safe exercises tailored to your daily routine.</p>
      </div>

      {/* Today's Focus */}
      <BorderGlow {...OVERVIEW_GLOW} className="w-full">
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-[#194793] text-white flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-[#121421] border border-[#727578]/40">
            🏋️
          </div>
          <div className="flex-1">
            <span className="text-xs font-black text-[#194793] uppercase tracking-widest block">{todayRoutine.day}'s Focus</span>
            <h2 className="text-xl font-heading font-black text-[#194793] mt-1 [text-shadow:1.5px_1.5px_0px_#121421]">{todayRoutine.focus}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-zinc-300 uppercase tracking-widest">
              <span className="flex items-center gap-1 text-white"><Timer className="w-3.5 h-3.5 text-[#194793]" /> {totalDuration} min</span>
              <span className="flex items-center gap-1 text-white"><Flame className="w-3.5 h-3.5 text-[#194793]" /> {totalCalories} cal</span>
              <span className="flex items-center gap-1 text-white"><CheckCircle className="w-3.5 h-3.5 text-[#194793]" /> {completedCount}/{todayRoutine.exercises.length} done</span>
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
            <BorderGlow key={idx} {...OVERVIEW_GLOW} className="w-full transition-all">
              <div className="p-5 sm:p-6 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border ${
                    isCompleted ? "bg-[#194793] text-white border-[#194793] shadow-md" : "bg-[#121421] border-[#727578]/40 text-white"
                  }`}>
                    {isCompleted ? <CheckCircle className="w-6 h-6 text-white" /> : ex.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-heading font-black ${isCompleted ? "text-zinc-500 line-through" : "text-[#194793] [text-shadow:1px_1px_0px_#121421]"}`}>
                      {ex.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-2">
                      <span className="bg-[#121421] px-2.5 py-1 rounded-full border border-[#727578]/40 text-[#194793]">{ex.category}</span>
                      <span className="bg-[#121421] px-2.5 py-1 rounded-full border border-[#727578]/40 text-[#194793]">{ex.duration} min</span>
                      <span className="bg-[#121421] px-2.5 py-1 rounded-full border border-[#727578]/40 text-[#194793]">{ex.calories} cal</span>
                      <span className={`px-2.5 py-1 rounded-full border bg-[#121421] text-white border-[#727578]/40`}>
                        {ex.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-[#727578]/30 sm:border-0 justify-between sm:justify-end">
                    {isActive && (
                      <span className="text-xl font-mono font-black text-[#194793] px-2">{formatTime(timer)}</span>
                    )}
                    
                    {!isCompleted && !isActive && (
                      <button onClick={() => startExercise(idx)} className="px-5 py-2.5 rounded-full bg-[#194793] text-white text-xs font-black shadow-lg shadow-[#121421] hover:scale-105 transition-all w-full sm:w-auto text-center border border-[#727578]/40">
                        <Play className="w-3.5 h-3.5 inline mr-1 text-white" /> Start
                      </button>
                    )}

                    {isActive && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-3 rounded-xl bg-[#121421] border border-[#727578]/40 text-white hover:bg-[#727578]/20 transition-colors">
                          {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button onClick={() => completeExercise(idx)} className="px-5 py-2.5 rounded-xl bg-[#194793] text-white text-xs font-black shadow-md border border-[#727578]/40 w-full sm:w-auto">
                          <CheckCircle className="w-3.5 h-3.5 inline mr-1 text-white" /> Done
                        </button>
                      </div>
                    )}

                    <button onClick={() => setExpandedExercise(isExpanded ? null : idx)} className="p-2.5 rounded-xl bg-[#121421] border border-[#727578]/40 text-[#194793] hover:text-white transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-[#727578]/30 space-y-4">
                    <div>
                      <span className="text-xs font-black text-[#194793] uppercase tracking-widest block mb-2">Steps:</span>
                      <ol className="mt-1 space-y-2">
                        {ex.steps.map((step, si) => (
                          <li key={si} className="text-sm font-medium text-zinc-300 flex gap-3">
                            <span className="text-[#194793] font-black shrink-0">{si + 1}.</span> {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="bg-[#121421] p-4 rounded-2xl border border-[#727578]/40">
                      <p className="text-sm text-zinc-200 font-medium mb-3"><strong className="text-[#194793] font-black uppercase tracking-widest text-xs block mb-1">Benefits:</strong> {ex.benefits}</p>
                      <p className="text-sm text-zinc-200 font-medium">
                        <Heart className="w-4 h-4 inline mr-1 text-[#194793]" /> <strong className="text-[#194793] font-black">DIABETIC BENEFIT:</strong> {ex.diabeticNote}
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
