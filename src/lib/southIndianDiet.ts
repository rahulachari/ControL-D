// South Indian / Andhra / Telugu Diabetes-Friendly Food Database

export interface FoodItem {
  id: string;
  name: string;
  teluguName: string;
  category: "breakfast" | "lunch" | "dinner" | "snack" | "side";
  calories: number;
  carbs: number;
  protein: number;
  fiber: number;
  fat: number;
  giScore: number; // 0-100
  sugarImpact: "low" | "moderate" | "high";
  portion: string;
  bestTimeToEat: string;
  why: string;
  alternatives: string[];
  cookingTips: string;
  isVeg: boolean;
}

export const FOOD_DATABASE: FoodItem[] = [
  // === BREAKFAST ===
  {
    id: "idli", name: "Idli (2 pcs)", teluguName: "ఇడ్లీ", category: "breakfast",
    calories: 130, carbs: 26, protein: 4, fiber: 1.5, fat: 0.5, giScore: 55,
    sugarImpact: "moderate", portion: "2 pcs (150g)", bestTimeToEat: "7:00-8:30 AM",
    why: "Fermented rice-lentil batter is easy to digest. Pair with sambar for balanced protein.",
    alternatives: ["Ragi Idli", "Oats Idli"], cookingTips: "Use brown rice batter for lower GI. Serve with coconut chutney and sambar.", isVeg: true
  },
  {
    id: "pesarattu", name: "Pesarattu (2 pcs)", teluguName: "పెసరట్టు", category: "breakfast",
    calories: 180, carbs: 22, protein: 12, fiber: 4, fat: 3, giScore: 32,
    sugarImpact: "low", portion: "2 pcs (150g)", bestTimeToEat: "7:00-8:30 AM",
    why: "Made from whole green gram — very high protein and low GI. Excellent for diabetics.",
    alternatives: ["MLA Pesarattu", "Plain Dosa"], cookingTips: "Soak moong dal overnight. Add ginger, green chilli, cumin. Serve with allam chutney.", isVeg: true
  },
  {
    id: "upma", name: "Rava Upma", teluguName: "ఉప్మా", category: "breakfast",
    calories: 200, carbs: 30, protein: 6, fiber: 2, fat: 5, giScore: 60,
    sugarImpact: "moderate", portion: "1 bowl (200g)", bestTimeToEat: "7:00-9:00 AM",
    why: "Quick and filling. Add vegetables for fiber to slow sugar absorption.",
    alternatives: ["Oats Upma", "Broken Wheat Upma"], cookingTips: "Dry roast rava first. Add plenty of vegetables — beans, carrots, peas.", isVeg: true
  },
  {
    id: "poha", name: "Poha (Atukulu)", teluguName: "అటుకులు", category: "breakfast",
    calories: 180, carbs: 32, protein: 4, fiber: 2, fat: 4, giScore: 55,
    sugarImpact: "moderate", portion: "1 bowl (180g)", bestTimeToEat: "7:00-9:00 AM",
    why: "Flattened rice cooks quickly and is light. Add peanuts for healthy fats.",
    alternatives: ["Thick Poha with vegetables"], cookingTips: "Rinse poha briefly. Temper with mustard, curry leaves, peanuts, onion.", isVeg: true
  },
  {
    id: "ragi_dosa", name: "Ragi Dosa", teluguName: "రాగి దోస", category: "breakfast",
    calories: 150, carbs: 24, protein: 5, fiber: 5, fat: 3, giScore: 35,
    sugarImpact: "low", portion: "2 pcs (150g)", bestTimeToEat: "7:00-8:30 AM",
    why: "Finger millet (ragi) is rich in calcium and has very low glycemic index. Top choice for diabetics.",
    alternatives: ["Ragi Sangati", "Ragi Mudde"], cookingTips: "Mix ragi flour with rice flour (3:1 ratio) for better taste and texture.", isVeg: true
  },
  {
    id: "oats_dalia", name: "Oats / Broken Wheat Dalia", teluguName: "ఓట్స్ దలియా", category: "breakfast",
    calories: 170, carbs: 28, protein: 7, fiber: 6, fat: 3, giScore: 40,
    sugarImpact: "low", portion: "1 bowl (200g)", bestTimeToEat: "7:00-8:30 AM",
    why: "High fiber content slows glucose absorption. Excellent for sustained energy.",
    alternatives: ["Steel Cut Oats Porridge"], cookingTips: "Cook with vegetables and spices. Avoid adding sugar. Use cinnamon for flavor.", isVeg: true
  },

  // === LUNCH / DINNER ===
  {
    id: "brown_rice_dal", name: "Brown Rice + Dal", teluguName: "బ్రౌన్ రైస్ + పప్పు", category: "lunch",
    calories: 400, carbs: 55, protein: 16, fiber: 8, fat: 6, giScore: 45,
    sugarImpact: "moderate", portion: "1 cup rice + 1/2 cup dal (250g)", bestTimeToEat: "12:30-1:30 PM",
    why: "Brown rice has lower GI than white rice. Dal adds essential protein and fiber.",
    alternatives: ["Hand-Pounded Rice", "Foxtail Millet Rice"], cookingTips: "Cook dal with turmeric, tomato, onion. Temper with mustard, cumin, curry leaves.", isVeg: true
  },
  {
    id: "korra_annam", name: "Foxtail Millet Rice (Korra)", teluguName: "కొర్ర అన్నం", category: "lunch",
    calories: 350, carbs: 48, protein: 12, fiber: 9, fat: 4, giScore: 35,
    sugarImpact: "low", portion: "1 cup cooked (200g)", bestTimeToEat: "12:30-1:30 PM",
    why: "Foxtail millet (Korra) has very low GI and is rich in iron. Ideal diabetic staple.",
    alternatives: ["Little Millet (Sama)", "Barnyard Millet (Udalu)"], cookingTips: "Cook like rice. Pairs excellently with sambar and palakura pappu.", isVeg: true
  },
  {
    id: "ragi_sangati", name: "Ragi Sangati (Ragi Mudde)", teluguName: "రాగి సంగటి", category: "lunch",
    calories: 280, carbs: 42, protein: 8, fiber: 7, fat: 2, giScore: 30,
    sugarImpact: "low", portion: "1 medium ball (200g)", bestTimeToEat: "12:30-1:30 PM or 7:30-8:30 PM",
    why: "Traditional Ragi preparation. Extremely low GI, calcium-rich, and very filling.",
    alternatives: ["Ragi Java (Porridge)"], cookingTips: "Mix ragi flour into boiling water slowly, stir continuously. Serve with tangy dal or pulusu.", isVeg: true
  },
  {
    id: "sambar_rice", name: "Sambar Rice", teluguName: "సాంబార్ అన్నం", category: "lunch",
    calories: 380, carbs: 52, protein: 14, fiber: 6, fat: 5, giScore: 50,
    sugarImpact: "moderate", portion: "1.5 cups (300g)", bestTimeToEat: "12:30-1:30 PM",
    why: "Sambar is packed with lentils and vegetables. Use brown rice or millet for best results.",
    alternatives: ["Rasam Rice"], cookingTips: "Add drumstick, pumpkin, brinjal, and beans to sambar for maximum nutrition.", isVeg: true
  },
  {
    id: "curd_rice", name: "Curd Rice (Perugu Annam)", teluguName: "పెరుగు అన్నం", category: "lunch",
    calories: 280, carbs: 40, protein: 10, fiber: 2, fat: 8, giScore: 42,
    sugarImpact: "low", portion: "1 cup (200g)", bestTimeToEat: "12:30-2:00 PM",
    why: "Probiotics from curd aid digestion and gut health. Cooling and easy to digest.",
    alternatives: ["Buttermilk Rice"], cookingTips: "Use leftover rice. Add grated cucumber, pomegranate. Temper with mustard and curry leaves.", isVeg: true
  },
  {
    id: "palakura_pappu", name: "Palakura Pappu (Spinach Dal)", teluguName: "పాలకూర పప్పు", category: "side",
    calories: 180, carbs: 18, protein: 12, fiber: 6, fat: 5, giScore: 25,
    sugarImpact: "low", portion: "1 cup (150g)", bestTimeToEat: "Lunch or Dinner",
    why: "Spinach is low-calorie, iron-rich, and when cooked with toor dal provides complete protein.",
    alternatives: ["Gongura Pappu", "Thotakura Pappu"], cookingTips: "Cook spinach with dal, turmeric, and garlic. Temper with ghee, cumin, red chilli.", isVeg: true
  },

  // === NON-VEG ===
  {
    id: "egg_curry", name: "Egg Curry (2 eggs)", teluguName: "గుడ్డు కూర", category: "side",
    calories: 250, carbs: 8, protein: 18, fiber: 1, fat: 16, giScore: 15,
    sugarImpact: "low", portion: "2 eggs + gravy (200g)", bestTimeToEat: "Lunch or Dinner",
    why: "Eggs are protein-rich with virtually no carbs. Excellent for blood sugar stability.",
    alternatives: ["Boiled Egg Salad", "Egg Bhurji"], cookingTips: "Cook in tomato-onion gravy with less oil. Add curry leaves and cumin.", isVeg: false
  },
  {
    id: "grilled_chicken", name: "Grilled Chicken (150g)", teluguName: "గ్రిల్ చికెన్", category: "side",
    calories: 220, carbs: 2, protein: 35, fiber: 0, fat: 8, giScore: 0,
    sugarImpact: "low", portion: "150g", bestTimeToEat: "Lunch or Dinner",
    why: "Lean protein with almost zero carbs. Does not raise blood sugar at all.",
    alternatives: ["Tandoori Chicken", "Chicken Tikka"], cookingTips: "Marinate with yogurt, turmeric, chilli powder. Grill or bake — avoid frying.", isVeg: false
  },
  {
    id: "fish_curry", name: "Fish Curry (Chepala Pulusu)", teluguName: "చేపల పులుసు", category: "side",
    calories: 200, carbs: 6, protein: 28, fiber: 1, fat: 7, giScore: 10,
    sugarImpact: "low", portion: "1 piece + gravy (200g)", bestTimeToEat: "Lunch or Dinner",
    why: "Fish provides omega-3 fatty acids that reduce inflammation and support heart health.",
    alternatives: ["Fish Fry", "Grilled Fish"], cookingTips: "Use tamarind base. Add drumstick leaves and green chillies for traditional Andhra flavor.", isVeg: false
  },

  // === SNACKS ===
  {
    id: "sprouts_chaat", name: "Sprouts Chaat", teluguName: "మొలకల చాట్", category: "snack",
    calories: 120, carbs: 16, protein: 8, fiber: 5, fat: 2, giScore: 25,
    sugarImpact: "low", portion: "1 cup (150g)", bestTimeToEat: "4:00-5:00 PM",
    why: "Sprouted moong is protein-dense and very low GI. Perfect diabetic snack.",
    alternatives: ["Boiled Peanuts", "Roasted Chana"], cookingTips: "Mix sprouted moong with onion, tomato, lemon, coriander, and chat masala.", isVeg: true
  },
  {
    id: "cucumber_raita", name: "Cucumber Raita", teluguName: "దోసకాయ పచ్చడి", category: "snack",
    calories: 80, carbs: 6, protein: 4, fiber: 1, fat: 4, giScore: 20,
    sugarImpact: "low", portion: "1 small bowl (100g)", bestTimeToEat: "Any time",
    why: "Cooling, low-calorie, and probiotic-rich. Hydrating and easy on blood sugar.",
    alternatives: ["Buttermilk (Majjiga)"], cookingTips: "Grate cucumber into fresh curd. Add roasted cumin powder, salt, and mint.", isVeg: true
  },
  {
    id: "roasted_peanuts", name: "Roasted Peanuts (30g)", teluguName: "వేరుశనగ", category: "snack",
    calories: 170, carbs: 5, protein: 8, fiber: 3, fat: 14, giScore: 14,
    sugarImpact: "low", portion: "1 handful (30g)", bestTimeToEat: "4:00-5:00 PM",
    why: "High in healthy fats and protein. Very low GI. Keeps you full between meals.",
    alternatives: ["Almonds", "Walnuts"], cookingTips: "Dry roast with a pinch of salt. Avoid oil-fried peanuts.", isVeg: true
  },
];

export type DietPreference = "veg" | "nonveg" | "mixed";

// Generate a daily meal plan based on diet preference
export function generateDailyPlan(preference: DietPreference = "veg"): {
  breakfast: FoodItem; midMorning: FoodItem; lunch: FoodItem; eveningSnack: FoodItem; dinner: FoodItem; sides: FoodItem[];
} {
  let items = FOOD_DATABASE;
  if (preference === "veg") {
    items = FOOD_DATABASE.filter((f) => f.isVeg);
  } else if (preference === "nonveg") {
    // Priority to non-veg for sides/lunches, veg for snacks/breakfast
    items = FOOD_DATABASE;
  }

  const breakfasts = items.filter((f) => f.category === "breakfast");
  const lunches = items.filter((f) => f.category === "lunch");
  const snacks = items.filter((f) => f.category === "snack");
  
  let sides = items.filter((f) => f.category === "side");
  if (preference === "nonveg") {
    sides = FOOD_DATABASE.filter((f) => !f.isVeg);
  } else if (preference === "mixed") {
    sides = FOOD_DATABASE.filter((f) => f.category === "side");
  }

  // Use day-of-year for deterministic daily rotation
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  const selectedSide1 = sides[dayOfYear % sides.length];
  const selectedSide2 = sides[(dayOfYear + 1) % sides.length];

  // Deduplicate sides so keys are unique
  const finalSides: FoodItem[] = [];
  if (selectedSide1) finalSides.push(selectedSide1);
  if (selectedSide2 && selectedSide2.id !== selectedSide1?.id) finalSides.push(selectedSide2);

  return {
    breakfast: breakfasts[dayOfYear % breakfasts.length],
    midMorning: snacks[(dayOfYear + 1) % snacks.length],
    lunch: lunches[dayOfYear % lunches.length],
    eveningSnack: snacks[(dayOfYear + 2) % snacks.length],
    dinner: lunches[(dayOfYear + 1) % lunches.length],
    sides: finalSides,
  };
}

export function searchFoods(query: string): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return FOOD_DATABASE.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.teluguName.includes(q) ||
      f.category.includes(q)
  );
}

export function getGIColor(gi: number): string {
  if (gi <= 35) return "text-emerald-500";
  if (gi <= 55) return "text-amber-500";
  return "text-rose-500";
}

export function getGILabel(gi: number): string {
  if (gi <= 35) return "Low GI";
  if (gi <= 55) return "Medium GI";
  return "High GI";
}
