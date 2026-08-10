// Central health data persistence layer for ControL-D
// All health data is date-keyed in localStorage

export interface SugarReading {
  id: string;
  value: number;
  context: string; // "before_breakfast" | "after_breakfast" | ... | "bedtime" | "random"
  time: string; // ISO string
  notes?: string;
}

export interface WaterEntry {
  id: string;
  amount: number; // ml
  time: string;
}

export interface MealEntry {
  id: string;
  type: "breakfast" | "mid_morning" | "lunch" | "evening_snack" | "dinner";
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fiber: number;
  giScore: number;
  time: string;
}

export interface MedEntry {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  status: "pending" | "taken" | "missed" | "skipped" | "snoozed";
  takenAt?: string;
  beforeAfterFood: "before" | "after" | "empty_stomach";
  doctorName?: string;
  remaining?: number;
  refillAt?: number;
  notes?: string;
}

export interface WorkoutEntry {
  id: string;
  name: string;
  duration: number; // minutes
  calories: number;
  type: string;
  completedAt: string;
}

export interface SleepEntry {
  bedtime: string;
  wakeTime: string;
  quality: number; // 1-5
  hours: number;
}

export interface MoodEntry {
  mood: "happy" | "normal" | "tired" | "anxious" | "stressed" | "sad";
  time: string;
}

export interface DailyGoals {
  drinkWater: boolean;
  walkSteps: boolean;
  takeMedicines: boolean;
  eatHealthy: boolean;
  logSugar: boolean;
  exercise: boolean;
  sleepWell: boolean;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  sugar: SugarReading[];
  water: WaterEntry[];
  meals: MealEntry[];
  meds: MedEntry[];
  workouts: WorkoutEntry[];
  sleep?: SleepEntry;
  mood?: MoodEntry;
  goals: DailyGoals;
  weight?: number;
}

// --- Date helpers ---
export function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function dateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

// --- Storage helpers ---
function storageKey(date: string): string {
  return `health_${date}`;
}

export function getDayData(date?: string): DayData {
  const key = date || todayKey();
  if (typeof window === "undefined") return emptyDay(key);
  const raw = localStorage.getItem(storageKey(key));
  if (!raw) return emptyDay(key);
  try {
    return JSON.parse(raw) as DayData;
  } catch {
    return emptyDay(key);
  }
}

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export function saveDayData(data: DayData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(data.date), JSON.stringify(data));

  // Sync with Supabase asynchronously if configured
  if (isSupabaseConfigured()) {
    supabase.auth.getUser().then(({ data: userData }) => {
      if (userData?.user?.id) {
        supabase
          .from("daily_health")
          .upsert(
            {
              user_id: userData.user.id,
              date: data.date,
              data: data,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,date" }
          )
          .then(({ error }) => {
            if (error) console.warn("Supabase health sync warning:", error);
          });
      }
    });
  }
}

export function emptyDay(date: string): DayData {
  return {
    date,
    sugar: [],
    water: [],
    meals: [],
    meds: [],
    workouts: [],
    goals: {
      drinkWater: false,
      walkSteps: false,
      takeMedicines: false,
      eatHealthy: false,
      logSugar: false,
      exercise: false,
      sleepWell: false,
    },
  };
}

// --- Sugar helpers ---
export function addSugarReading(reading: Omit<SugarReading, "id">): DayData {
  const day = getDayData();
  day.sugar.push({ ...reading, id: crypto.randomUUID() });
  day.goals.logSugar = true;
  saveDayData(day);
  return day;
}

export function getLatestSugar(): SugarReading | null {
  const day = getDayData();
  if (day.sugar.length === 0) return null;
  return day.sugar[day.sugar.length - 1];
}

export function getSugarStatus(value: number): { label: string; color: string; emoji: string } {
  if (value < 70) return { label: "Low", color: "text-amber-500", emoji: "⚠️" };
  if (value <= 140) return { label: "Normal", color: "text-emerald-500", emoji: "✅" };
  return { label: "High", color: "text-rose-500", emoji: "🔴" };
}

// --- Water helpers ---
export function addWater(amount: number): DayData {
  const day = getDayData();
  day.water.push({ id: crypto.randomUUID(), amount, time: new Date().toISOString() });
  const total = day.water.reduce((s, w) => s + w.amount, 0);
  const profile = getProfile();
  const target = profile ? Math.round(profile.weight * 35) : 2450;
  if (total >= target) day.goals.drinkWater = true;
  saveDayData(day);
  return day;
}

export function getTotalWater(date?: string): number {
  const day = getDayData(date);
  return day.water.reduce((s, w) => s + w.amount, 0);
}

export function resetWater(): DayData {
  const day = getDayData();
  day.water = [];
  day.goals.drinkWater = false;
  saveDayData(day);
  return day;
}

// --- Meal helpers ---
export function addMeal(meal: Omit<MealEntry, "id">): DayData {
  const day = getDayData();
  day.meals.push({ ...meal, id: crypto.randomUUID() });
  saveDayData(day);
  return day;
}

export function removeMealByType(type: string): DayData {
  const day = getDayData();
  for (let i = day.meals.length - 1; i >= 0; i--) {
    if (day.meals[i].type === type) {
      day.meals.splice(i, 1);
      break;
    }
  }
  saveDayData(day);
  return day;
}

export function getTotalCalories(date?: string): number {
  const day = getDayData(date);
  return day.meals.reduce((s, m) => s + m.calories, 0);
}

// --- Workout helpers ---
export function addWorkout(workout: Omit<WorkoutEntry, "id">): DayData {
  const day = getDayData();
  day.workouts.push({ ...workout, id: crypto.randomUUID() });
  day.goals.exercise = true;
  saveDayData(day);
  return day;
}

export function getTotalExerciseMinutes(date?: string): number {
  const day = getDayData(date);
  return day.workouts.reduce((s, w) => s + w.duration, 0);
}

// --- Mood helpers ---
export function setMood(mood: MoodEntry["mood"]): DayData {
  const day = getDayData();
  day.mood = { mood, time: new Date().toISOString() };
  saveDayData(day);
  return day;
}

// --- Sleep helpers ---
export function setSleep(sleep: SleepEntry): DayData {
  const day = getDayData();
  day.sleep = sleep;
  if (sleep.hours >= 7) day.goals.sleepWell = true;
  saveDayData(day);
  return day;
}

// --- Goals helpers ---
export function updateGoal(goalKey: keyof DailyGoals, value: boolean): DayData {
  const day = getDayData();
  day.goals[goalKey] = value;
  saveDayData(day);
  return day;
}

export function getGoalCompletion(date?: string): number {
  const day = getDayData(date);
  const goals = day.goals;
  const total = Object.keys(goals).length;
  const done = Object.values(goals).filter(Boolean).length;
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

// --- Health Score ---
export function calculateHealthScore(date?: string): { score: number; grade: string; color: string } {
  const day = getDayData(date);
  const profile = getProfile();
  let score = 0;

  // Sugar (25 pts) — last reading in range
  if (day.sugar.length > 0) {
    const last = day.sugar[day.sugar.length - 1].value;
    if (last >= 70 && last <= 140) score += 25;
    else if (last >= 60 && last <= 180) score += 15;
    else score += 5;
  }

  // Water (15 pts)
  const waterTotal = day.water.reduce((s, w) => s + w.amount, 0);
  const waterTarget = profile ? Math.round(profile.weight * 35) : 2450;
  const waterPct = Math.min(waterTotal / waterTarget, 1);
  score += Math.round(waterPct * 15);

  // Meals (15 pts) — logged at least 2 meals
  if (day.meals.length >= 3) score += 15;
  else if (day.meals.length >= 2) score += 10;
  else if (day.meals.length >= 1) score += 5;

  // Medicine (20 pts)
  if (day.meds.length > 0) {
    const taken = day.meds.filter((m) => m.status === "taken").length;
    const pct = taken / day.meds.length;
    score += Math.round(pct * 20);
  } else {
    score += 20; // no meds scheduled = full credit
  }

  // Exercise (10 pts)
  const exerciseMin = day.workouts.reduce((s, w) => s + w.duration, 0);
  if (exerciseMin >= 30) score += 10;
  else if (exerciseMin >= 15) score += 7;
  else if (exerciseMin > 0) score += 3;

  // Sleep (10 pts)
  if (day.sleep) {
    if (day.sleep.hours >= 7 && day.sleep.hours <= 9) score += 10;
    else if (day.sleep.hours >= 6) score += 6;
    else score += 2;
  }

  // Mood bonus (5 pts)
  if (day.mood) {
    if (day.mood.mood === "happy") score += 5;
    else if (day.mood.mood === "normal") score += 4;
    else if (day.mood.mood === "tired") score += 2;
    else score += 1;
  }

  score = Math.min(score, 100);

  let grade = "Needs Attention";
  let color = "text-rose-500";
  if (score >= 90) { grade = "Excellent"; color = "text-emerald-500"; }
  else if (score >= 75) { grade = "Good"; color = "text-blue-500"; }
  else if (score >= 60) { grade = "Fair"; color = "text-amber-500"; }
  else if (score >= 40) { grade = "Needs Improvement"; color = "text-orange-500"; }

  return { score, grade, color };
}

// --- Streaks ---
export function getStreak(): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const day = getDayData(key);
    const completion = Object.values(day.goals).filter(Boolean).length;
    if (completion >= 3) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// --- Profile ---
export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  activityLevel: string;
  diabetesType: string;
  targetWater?: number;
  targetCalories?: number;
}

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("userProfile");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("userProfile", JSON.stringify(profile));

  if (isSupabaseConfigured()) {
    supabase.auth.getUser().then(({ data: userData }) => {
      if (userData?.user?.id) {
        supabase
          .from("profiles")
          .upsert({
            id: userData.user.id,
            name: profile.name,
            age: profile.age,
            weight: profile.weight,
            height: profile.height,
            gender: profile.gender,
            activity_level: profile.activityLevel,
            diabetes_type: profile.diabetesType,
            target_water: profile.targetWater,
            target_calories: profile.targetCalories,
            updated_at: new Date().toISOString(),
          })
          .then(({ error }) => {
            if (error) console.warn("Supabase profile sync warning:", error);
          });
      }
    });
  }
}

export async function syncFromSupabase(dateStr?: string): Promise<DayData | null> {
  if (!isSupabaseConfigured() || typeof window === "undefined") return null;

  const targetDate = dateStr || todayKey();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user?.id) return null;

  const { data, error } = await supabase
    .from("daily_health")
    .select("data")
    .eq("user_id", userData.user.id)
    .eq("date", targetDate)
    .single();

  if (error || !data?.data) return null;

  const remoteDay = data.data as DayData;
  localStorage.setItem(storageKey(targetDate), JSON.stringify(remoteDay));
  return remoteDay;
}

// --- Weekly data ---
export function getWeeklyData(): DayData[] {
  const days: DayData[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(getDayData(dateKey(d)));
  }
  return days;
}

// --- Motivational quotes ---
const MOTIVATIONS = [
  "Small steps every day lead to big results. You've got this! 💪",
  "Managing diabetes is a marathon, not a sprint. Stay consistent! 🏃",
  "Every healthy meal is an investment in your future. 🥗",
  "Your body is your most priceless possession. Take care of it! ❤️",
  "Progress, not perfection. Keep moving forward! 🌟",
  "A 15-minute walk after meals can reduce sugar spikes by 20%. 🚶",
  "Hydration is the simplest medicine. Drink water regularly! 💧",
  "Good sleep repairs your body. Aim for 7-8 hours tonight. 😴",
  "You are stronger than your diagnosis. Keep fighting! 🛡️",
  "Consistency beats intensity. Small daily habits win. 🎯",
];

export function getDailyMotivation(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return MOTIVATIONS[dayOfYear % MOTIVATIONS.length];
}

// --- AI Health Tips ---
export function getAIHealthTip(): string {
  const day = getDayData();
  const profile = getProfile();

  // Contextual tips based on today's data
  const waterTotal = day.water.reduce((s, w) => s + w.amount, 0);
  const waterTarget = profile ? Math.round(profile.weight * 35) : 2450;

  if (day.sugar.length > 0) {
    const last = day.sugar[day.sugar.length - 1].value;
    if (last > 180) return "Your last sugar reading was high. Consider a 15-min walk and avoid carbs for the next meal.";
    if (last < 70) return "Your sugar is low. Have 15g of fast-acting carbs (glucose tablets, juice) immediately.";
  }

  if (waterTotal < waterTarget * 0.3) return "You're behind on hydration today. Try to drink a glass of water right now! 💧";

  if (day.meals.length === 0) {
    const hour = new Date().getHours();
    if (hour > 9) return "You haven't logged any meals today. Regular eating helps stabilize blood sugar.";
  }

  if (day.workouts.length === 0 && new Date().getHours() > 14) {
    return "Consider a short evening walk. Post-dinner walks are excellent for glucose control.";
  }

  if (!day.mood) return "How are you feeling today? Logging your mood helps us correlate it with your health data.";

  return "Keep up the great work! Consistent tracking is the key to better health management. 🌟";
}

// --- Lab Reports ---
export interface LabReport {
  id: string;
  file_name: string;
  test_date: string;
  overall_summary: string;
  parameters: any[];
  action_plan: string[];
  raw_text?: string;
  created_at: string;
}

export function saveLabReport(report: LabReport): void {
  if (typeof window === "undefined") return;
  const reports = getLabReports();
  // Avoid duplicates
  const existingIndex = reports.findIndex(r => r.id === report.id);
  if (existingIndex >= 0) {
    reports[existingIndex] = report;
  } else {
    reports.unshift(report);
  }
  localStorage.setItem("lab_reports", JSON.stringify(reports));

  if (isSupabaseConfigured()) {
    supabase.auth.getUser().then(({ data: userData }) => {
      if (userData?.user?.id) {
        supabase
          .from("lab_reports")
          .upsert({
            id: report.id,
            user_id: userData.user.id,
            file_name: report.file_name,
            test_date: report.test_date,
            overall_summary: report.overall_summary,
            parameters: report.parameters,
            action_plan: report.action_plan,
            raw_text: report.raw_text,
            created_at: report.created_at
          })
          .then(({ error }) => {
            if (error) console.warn("Supabase lab reports sync warning:", error);
          });
      }
    });
  }
}

export function getLabReports(): LabReport[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("lab_reports");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LabReport[];
  } catch {
    return [];
  }
}

export async function syncLabReportsFromSupabase(): Promise<LabReport[]> {
  if (!isSupabaseConfigured() || typeof window === "undefined") return getLabReports();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user?.id) return getLabReports();

  const { data, error } = await supabase
    .from("lab_reports")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (!error && data) {
    localStorage.setItem("lab_reports", JSON.stringify(data));
    return data as LabReport[];
  }
  return getLabReports();
}
