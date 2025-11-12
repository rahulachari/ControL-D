import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, date, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    const prompt = `Generate a healthy meal plan for a person with ${profile.diabetesType} diabetes.
Activity level: ${profile.activityLevel}
Dietary preferences: ${profile.dietaryPreferences.join(', ') || 'None'}
Allergies: ${profile.allergies.join(', ') || 'None'}

Create 4 meals (breakfast, lunch, dinner, snack) with nutritional info.
Return ONLY a JSON array with this structure:
[{"meal_type": "breakfast", "meal_name": "...", "description": "...", "calories": 300, "carbohydrates": 40, "protein": 15, "fat": 10, "fiber": 5}]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const meals = JSON.parse(content.replace(/```json|```/g, ''));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    for (const meal of meals) {
      await supabase.from('meal_plans').insert({
        user_id: userId,
        date,
        ...meal,
        ai_generated: true,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});