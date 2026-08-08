"use client";

import { useState, useEffect } from "react";
import { Utensils, Sparkles, Search, Leaf, Flame, Wheat, Droplets, Clock, Info, ChevronDown, ChevronUp, Drumstick, Layers } from "lucide-react";
import { generateDailyPlan, searchFoods, getGIColor, getGILabel, FoodItem, FOOD_DATABASE, DietPreference } from "@/lib/southIndianDiet";
import { addMeal } from "@/lib/healthStore";
import BorderGlow from "@/components/ui/BorderGlow";

const MONO_GLOW = {
  backgroundColor: "#09090b",
  glowColor: "0 0 100",
  colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
  borderRadius: 24,
};

function FoodCard({ food, onLog }: { food: FoodItem; onLog?: (f: FoodItem) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] border border-[#727578]/30 rounded-3xl p-5 shadow-lg hover:border-[#194793] transition-all flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-heading font-black text-[#194793] mb-0.5 leading-tight [text-shadow:1px_1px_0px_#121421]">{food.name}</h4>
          <span className="text-xs font-bold text-zinc-400 block uppercase tracking-widest">{food.teluguName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${food.isVeg ? "bg-[#194793] text-white" : "bg-rose-500 text-white"}`}>
            {food.isVeg ? "Veg" : "Non-Veg"}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-[#121421] text-[#194793] border border-[#727578]/40`}>
            GI {food.giScore} • {getGILabel(food.giScore)}
          </span>
        </div>
      </div>

      {/* Macro Grid */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center my-4 mt-auto">
        <div className="bg-[#121421] rounded-2xl py-2.5 sm:py-3 px-0.5 sm:px-1 border border-[#727578]/30 shadow-inner min-w-0">
          <Flame className="w-3.5 h-3.5 text-[#194793] mx-auto mb-1" />
          <span className="text-[11px] sm:text-xs font-black text-white block truncate">{food.calories}</span>
          <span className="text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase block">kcal</span>
        </div>
        <div className="bg-[#121421] rounded-2xl py-2.5 sm:py-3 px-0.5 sm:px-1 border border-[#727578]/30 shadow-inner min-w-0">
          <Wheat className="w-3.5 h-3.5 text-[#194793] mx-auto mb-1" />
          <span className="text-[11px] sm:text-xs font-black text-white block truncate">{food.carbs}g</span>
          <span className="text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase block">Carbs</span>
        </div>
        <div className="bg-[#121421] rounded-2xl py-2.5 sm:py-3 px-0.5 sm:px-1 border border-[#727578]/30 shadow-inner min-w-0">
          <Droplets className="w-3.5 h-3.5 text-[#194793] mx-auto mb-1" />
          <span className="text-[11px] sm:text-xs font-black text-white block truncate">{food.protein}g</span>
          <span className="text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase block">Protein</span>
        </div>
        <div className="bg-[#121421] rounded-2xl py-2.5 sm:py-3 px-0.5 sm:px-1 border border-[#727578]/30 shadow-inner min-w-0">
          <Leaf className="w-3.5 h-3.5 text-[#194793] mx-auto mb-1" />
          <span className="text-[11px] sm:text-xs font-black text-white block truncate">{food.fiber}g</span>
          <span className="text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase block">Fiber</span>
        </div>
        <div className="bg-[#121421] rounded-2xl py-2.5 sm:py-3 px-0.5 sm:px-1 border border-[#727578]/30 shadow-inner min-w-0">
          <span className={`text-[10px] font-black block leading-none ${food.sugarImpact === "low" ? "text-[#194793]" : food.sugarImpact === "moderate" ? "text-amber-400" : "text-rose-400"}`}>
            {food.sugarImpact === "low" ? "↓" : food.sugarImpact === "moderate" ? "→" : "↑"}
          </span>
          <span className="text-[10px] sm:text-xs font-black text-white block capitalize mt-0.5 truncate">{food.sugarImpact}</span>
          <span className="text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase block">Sugar</span>
        </div>
      </div>

      {/* Best time */}
      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-300 mb-3 bg-[#121421] px-3 py-2 rounded-xl border border-[#727578]/30 w-full text-center">
        <Clock className="w-3 h-3 text-[#194793]" /> Best time: {food.bestTimeToEat}
      </div>

      {/* Expand / Collapse */}
      <button onClick={() => setExpanded(!expanded)} className="flex w-full justify-center items-center gap-1.5 text-xs text-[#194793] font-black hover:text-white transition-colors group bg-[#121421] border border-[#727578]/30 py-2 rounded-xl mb-2">
        <Info className="w-3.5 h-3.5" /> {expanded ? "Less Details" : "Why this food? + Tips"}
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mb-2 pt-3 border-t border-[#727578]/30 text-xs text-zinc-300 space-y-2.5 px-2">
          <p><strong className="text-[#194793] font-black">Why:</strong> {food.why}</p>
          <p><strong className="text-[#194793] font-black">Cooking Tips:</strong> {food.cookingTips}</p>
          <p><strong className="text-[#194793] font-black">Alternatives:</strong> {food.alternatives.join(", ")}</p>
        </div>
      )}

      {/* Log Button */}
      {onLog && (
        <button
          onClick={() => onLog(food)}
          className="mt-2 w-full py-3.5 rounded-2xl bg-[#194793] hover:bg-[#194793]/90 text-white text-sm font-black transition-all shadow-lg shadow-[#121421] flex items-center justify-center gap-2 border border-[#727578]/40"
        >
          <Sparkles className="w-4 h-4 text-white" /> Log This Meal
        </button>
      )}
    </div>
  );
}

export default function MealPlanner() {
  const [plan, setPlan] = useState<ReturnType<typeof generateDailyPlan> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [activeTab, setActiveTab] = useState<"plan" | "search" | "all">("plan");
  const [dietPref, setDietPref] = useState<DietPreference>("veg");
  const [loggedMessage, setLoggedMessage] = useState("");

  useEffect(() => {
    setPlan(generateDailyPlan(dietPref));
  }, [dietPref]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setSearchResults(searchFoods(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleLog = (food: FoodItem) => {
    const mealType = food.category === "snack" ? "evening_snack" : food.category === "side" ? "lunch" : food.category;
    addMeal({
      type: mealType as any,
      name: food.name,
      calories: food.calories,
      carbs: food.carbs,
      protein: food.protein,
      fiber: food.fiber,
      giScore: food.giScore,
      time: new Date().toISOString(),
    });
    setLoggedMessage(`✅ ${food.name} logged!`);
    setTimeout(() => setLoggedMessage(""), 2000);
  };

  const tabs = [
    { key: "plan" as const, label: "Today's Plan" },
    { key: "search" as const, label: "Search Foods" },
    { key: "all" as const, label: "Full Database" },
  ];

  return (
    <div className="space-y-6">

      {/* Diet Preference Toggles */}
      <BorderGlow {...MONO_GLOW} className="w-full">
        <div className="p-5 flex flex-col sm:flex-row items-center justify-between flex-wrap gap-4 bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] rounded-[24px] border border-[#727578]/30">
          <div className="text-center sm:text-left">
            <span className="text-xs font-black text-[#194793] uppercase tracking-widest block mb-1">Diet Preference</span>
            <span className="text-xs font-bold text-zinc-400">Rotates daily based on your choice</span>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {[
              { key: "veg" as const, label: "Veg", icon: Leaf },
              { key: "nonveg" as const, label: "Non-Veg", icon: Drumstick },
              { key: "mixed" as const, label: "Mixed", icon: Layers },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = dietPref === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setDietPref(item.key)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    isSelected
                      ? "bg-[#194793] text-white shadow-lg shadow-[#121421]"
                      : "bg-[#121421] border border-[#727578]/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </BorderGlow>

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 sm:flex-none px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.key
                ? "bg-[#194793] text-white shadow-lg shadow-[#121421]"
                : "bg-[#121421] border border-[#727578]/40 text-zinc-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loggedMessage && (
        <div className="px-5 py-3 rounded-2xl bg-white text-black text-sm font-black text-center shadow-lg shadow-white/20 animate-in slide-in-from-top-4 duration-300">
          {loggedMessage}
        </div>
      )}

      {/* Today's Plan */}
      {activeTab === "plan" && plan && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: "🌅 Breakfast", food: plan.breakfast },
              { label: "🍎 Mid-Morning Snack", food: plan.midMorning },
              { label: "🍚 Lunch", food: plan.lunch },
              { label: "☕ Evening Snack", food: plan.eveningSnack },
              { label: "🌙 Dinner", food: plan.dinner },
            ].map(({ label, food }) => (
              <div key={label} className="flex flex-col">
                <h4 className="text-sm font-heading font-black text-white mb-3 tracking-widest uppercase">{label}</h4>
                <div className="flex-1">
                  <FoodCard food={food} onLog={handleLog} />
                </div>
              </div>
            ))}
          </div>

          {plan.sides.length > 0 && (
            <div>
              <h4 className="text-sm font-heading font-black text-white mb-3 mt-8 tracking-widest uppercase border-t border-zinc-800 pt-8">🥘 Recommended Sides</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plan.sides.map((s, idx) => (
                  <FoodCard key={`${s.id}-${idx}`} food={s} onLog={handleLog} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      {activeTab === "search" && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search foods... (e.g. idli, ragi, chicken)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-3xl bg-zinc-900 border border-zinc-800 outline-none text-base font-bold text-white placeholder-zinc-500 focus:border-white transition-all shadow-inner"
            />
          </div>
          {searchResults.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((f, idx) => <FoodCard key={`${f.id}-${idx}`} food={f} onLog={handleLog} />)}
            </div>
          ) : searchQuery.length >= 2 ? (
            <p className="text-sm font-bold text-zinc-500 text-center py-10">No foods found for "{searchQuery}"</p>
          ) : (
            <p className="text-sm font-bold text-zinc-500 text-center py-10">Type at least 2 characters to search</p>
          )}
        </div>
      )}

      {/* Full Database */}
      {activeTab === "all" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(dietPref === "veg"
            ? FOOD_DATABASE.filter((f) => f.isVeg)
            : dietPref === "nonveg"
            ? FOOD_DATABASE.filter((f) => !f.isVeg)
            : FOOD_DATABASE
          ).map((f, idx) => (
            <FoodCard key={`${f.id}-${idx}`} food={f} onLog={handleLog} />
          ))}
        </div>
      )}
    </div>
  );
}
