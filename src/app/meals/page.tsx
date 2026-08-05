import { Utensils } from "lucide-react";
import MealPlanner from "@/components/dashboard/MealPlanner";

export default function MealsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-heading font-black text-white tracking-tight flex items-center gap-2">
          <Utensils className="w-7 h-7 text-emerald-400" /> Meal Tracking
        </h1>
        <p className="text-sm text-zinc-400 font-medium">Plan and track your daily nutrition and impact on glucose.</p>
      </div>
      <MealPlanner />
    </div>
  );
}
