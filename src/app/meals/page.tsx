import { Utensils } from "lucide-react";
import MealPlanner from "@/components/dashboard/MealPlanner";

export default function MealsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-28 sm:pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-heading font-black text-[#194793] tracking-tight [text-shadow:2px_2px_0px_#121421] flex items-center gap-2">
          <Utensils className="w-7 h-7 text-[#194793]" /> Meal Tracking
        </h1>
        <p className="text-sm text-zinc-300 font-medium">Plan and track your daily nutrition and impact on glucose.</p>
      </div>
      <MealPlanner />
    </div>
  );
}
