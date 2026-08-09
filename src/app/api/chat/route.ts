import { NextResponse } from "next/server";

// Basic in-memory rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_MAX_REQUESTS = 15;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  
  // Rate limiting logic
  const now = Date.now();
  const userRate = rateLimit.get(ip) || { count: 0, timestamp: now };
  
  if (now - userRate.timestamp > RATE_LIMIT_WINDOW_MS) {
    userRate.count = 1;
    userRate.timestamp = now;
  } else {
    userRate.count++;
  }
  rateLimit.set(ip, userRate);

  if (userRate.count > RATE_LIMIT_MAX_REQUESTS) {
    console.warn(`[API SECURITY] Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json(
      { role: "assistant", content: "You are sending messages too quickly. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  try {
    const { messages, userContext } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    const apiKey = (process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || "").trim().replace(/^["']|["']$/g, '');

    console.info(`[API CALL] Chat request received. Messages: ${messages?.length}, IP: ${ip}`);

    const systemPrompt = `You are ControL-D AI Health Assistant, a fast, expert digital health companion for diabetes care.
${userContext ? `Patient: ${userContext.profile?.name || "Patient"}, Sugar Today: ${JSON.stringify(userContext.todaySugarReadings || [])}` : ""}

Rules:
- Be extremely concise, direct, and fast (max 3-4 bullet points).
- Focus on low-GI foods, South Indian diet (Idli, Pesarattu, Ragi), sugar control, and hydration.
- CRITICAL: Never invent, guess, or hallucinate medical information. If you do not know, say you do not know.
- Always include a brief medical disclaimer at the end.`;

    if (!apiKey || apiKey.includes("your-api-key")) {
      return NextResponse.json({
        role: "assistant",
        content: getLocalFallbackResponse(lastUserMessage),
      });
    }

    // Supported active Groq models
    const models = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "openai/gpt-oss-120b"
    ];

    for (const model of models) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.slice(-4).map((m: any) => ({ role: m.role, content: m.content })),
            ],
            temperature: 0.1,
            max_tokens: 350,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            console.info(`[API SUCCESS] Responded successfully using model: ${model}`);
            return NextResponse.json({ role: "assistant", content: reply });
          }
        } else {
          console.error(`[API ERROR] Groq API error with model ${model}: ${response.status} ${response.statusText}`);
        }
      } catch (err: any) {
        console.error(`[API ERROR] Failed to fetch from model ${model}:`, err.message);
      }
    }

    // Fallback if API fails
    console.warn(`[API FALLBACK] All Groq models failed, returning local fallback response for IP: ${ip}`);
    return NextResponse.json({
      role: "assistant",
      content: getLocalFallbackResponse(lastUserMessage),
    });
  } catch (error: any) {
    console.error(`[API FATAL] Unexpected error in chat route:`, error.message || error);
    return NextResponse.json({
      role: "assistant",
      content: "I apologize, but I encountered a temporary issue. Here is a quick tip: A 15-minute walk after meals significantly lowers blood sugar. Please try again!",
    });
  }
}

function getLocalFallbackResponse(userMsg: string): string {
  const msg = userMsg.toLowerCase();

  // Egg and Curd / Dairy / Combination Queries
  if (msg.includes("egg") || msg.includes("curd") || msg.includes("dahi") || msg.includes("yogurt")) {
    return `### ⚠️ Offline Mode (Local Clinical Knowledge)

**Yes, eggs and curd (dahi) can be safely eaten together!**

- **Glycemic Impact**: Both eggs and plain curd are low-carbohydrate, low-GI foods that won't cause blood sugar spikes.
- **Nutritional Synergy**: Eggs provide high-quality protein and essential healthy fats, while unsweetened curd supplies gut-friendly probiotics and calcium.
- **Preparation Tip**: Choose unflavoured, unsweetened curd and prepare eggs with minimal oil or boiled.
- *Disclaimer: Consult your doctor or nutritionist for personalized dietary plans.*`;
  }

  // High Sugar / Spikes / Emergency Queries
  if (msg.includes("high") || msg.includes("200") || msg.includes("220") || msg.includes("250") || msg.includes("spike") || msg.includes("lower")) {
    return `### ⚠️ Offline Mode (Local Clinical Knowledge)

**Action Plan for High Blood Sugar / Glucose Spikes:**

- **Hydrate Immediately**: Drink 1–2 large glasses of water to assist your kidneys in flushing excess glucose through urine.
- **Light Post-Meal Walk**: A 15-minute brisk walk helps active muscles absorb blood sugar without insulin spikes.
- **Review Medications**: Check if you have missed your prescribed diabetes medication or insulin.
- **Avoid Carbs**: Refrain from eating high-GI carbs or sugary snacks until blood sugar normalizes.
- *Disclaimer: If blood sugar remains consistently over 250 mg/dL or you feel unwell, seek medical attention.*`;
  }

  // South Indian Diet Queries
  if (msg.includes("south indian") || msg.includes("idli") || msg.includes("dosa") || msg.includes("pesarattu") || msg.includes("ragi") || msg.includes("rice")) {
    return `### ⚠️ Offline Mode (Local Clinical Knowledge)

**South Indian Diabetes-Friendly Meal Guidance:**

- **Prefer Low-GI Options**: Swap polished white rice idlis with **Moong Dal Pesarattu**, **Ragi Dosa**, or **Oats Idli**.
- **Pair with Fiber & Protein**: Always pair idli/dosa with vegetable-rich **Sambar** and coconut/chana dal chutney to slow down sugar absorption.
- **Portion Control**: Limit white rice to smaller portions and fill half your plate with non-starchy vegetables.
- *Disclaimer: Consult your dietician for personalized meal planning.*`;
  }

  // Water & Hydration Queries
  if (msg.includes("water") || msg.includes("drink") || msg.includes("hydration") || msg.includes("fluid") || msg.includes("intake")) {
    return `### ⚠️ Offline Mode (Local Clinical Knowledge)

**Daily Hydration Recommendations:**

- **Recommended Volume**: Aim for **2.5 to 3.0 Liters** of plain water daily.
- **Blood Sugar Flush**: Adequate water intake helps kidneys eliminate excess glucose via urine.
- **Optimal Habit**: Sip water steadily throughout the day rather than drinking large amounts at once.
- *Disclaimer: Adjust water intake if you have specific renal or cardiac fluid restrictions.*`;
  }

  // Exercise & Physical Activity Queries
  if (msg.includes("walk") || msg.includes("exercise") || msg.includes("workout") || msg.includes("gym") || msg.includes("activity")) {
    return `### ⚠️ Offline Mode (Local Clinical Knowledge)

**Exercise Guidelines for Glucose Control:**

- **Post-Meal Walks**: Walking for 10–15 minutes right after meals reduces glucose spikes by up to 30%.
- **Weekly Target**: Aim for 150 minutes of moderate aerobic activity per week (e.g., brisk walking, cycling).
- **Muscle Engagement**: Simple bodyweight exercises (squats, leg raises) increase insulin sensitivity.
- *Disclaimer: Always check blood sugar levels before intense physical exercise.*`;
  }

  // Default Fallback
  return `### ⚠️ Offline Mode (Local Clinical Knowledge)

I am currently running in offline knowledge mode. Here is essential health guidance based on your query:

- **Diet**: Focus on low-GI foods, lean proteins (eggs, pulses), and fiber-rich vegetables.
- **Hydration**: Drink 2.5–3L of water daily to support glucose regulation.
- **Exercise**: A 15-minute walk after meals helps prevent postprandial sugar spikes.

*Configure GROQ_API_KEY in your deployment environment variables for real-time AI responses.*`;
}
