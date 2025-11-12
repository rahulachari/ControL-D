import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Calendar, Utensils } from "lucide-react";
import { format } from "date-fns";

interface MealPlannerProps {
  userId: string;
}

const MealPlanner = ({ userId }: MealPlannerProps) => {
  const { toast } = useToast();
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchMeals();
  }, [userId, selectedDate]);

  const fetchMeals = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("date", dateStr)
      .order("meal_type");

    if (data) {
      setMeals(data);
    }
  };

  const generateAIMealPlan = async () => {
    setGeneratingAI(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          userId,
          date: format(selectedDate, 'yyyy-MM-dd'),
          profile: {
            diabetesType: profile.diabetes_type,
            dietaryPreferences: profile.dietary_preferences || [],
            allergies: profile.allergies || [],
            activityLevel: profile.activity_level,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Meal Plan Generated!",
        description: "Your personalized meal plan is ready",
      });

      fetchMeals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate meal plan",
        variant: "destructive",
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const mealIcons: Record<string, any> = {
    breakfast: "🍳",
    lunch: "🥗",
    dinner: "🍽️",
    snack: "🍎"
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold flex items-center gap-2 mb-2">
              <Utensils className="w-6 h-6 text-secondary" />
              Meal Planner
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="bg-transparent border-none text-foreground"
              />
            </div>
          </div>
          <Button
            onClick={generateAIMealPlan}
            disabled={generatingAI}
            className="bg-gradient-primary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {generatingAI ? "Generating..." : "Generate AI Meal Plan"}
          </Button>
        </div>

        {meals.length === 0 ? (
          <div className="text-center py-12">
            <Utensils className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No meal plan for this date yet</p>
            <Button
              onClick={generateAIMealPlan}
              disabled={generatingAI}
              className="bg-gradient-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{mealIcons[meal.meal_type]}</span>
                  <div>
                    <h4 className="font-semibold capitalize">{meal.meal_type}</h4>
                    {meal.ai_generated && (
                      <span className="text-xs text-secondary flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Generated
                      </span>
                    )}
                  </div>
                </div>
                <p className="font-medium text-lg mb-1">{meal.meal_name}</p>
                {meal.description && (
                  <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {meal.calories && (
                    <div>
                      <span className="text-muted-foreground">Calories:</span>{" "}
                      <span className="font-medium">{meal.calories}</span>
                    </div>
                  )}
                  {meal.carbohydrates && (
                    <div>
                      <span className="text-muted-foreground">Carbs:</span>{" "}
                      <span className="font-medium">{meal.carbohydrates}g</span>
                    </div>
                  )}
                  {meal.protein && (
                    <div>
                      <span className="text-muted-foreground">Protein:</span>{" "}
                      <span className="font-medium">{meal.protein}g</span>
                    </div>
                  )}
                  {meal.fiber && (
                    <div>
                      <span className="text-muted-foreground">Fiber:</span>{" "}
                      <span className="font-medium">{meal.fiber}g</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MealPlanner;