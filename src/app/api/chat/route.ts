import { NextResponse } from "next/server";

// Basic in-memory rate limiting (Note: in serverless environments, this resets per cold start/instance, but provides baseline protection)
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_MAX_REQUESTS = 10;
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

    const apiKey = process.env.GROQ_API_KEY;

    console.info(`[API CALL] Chat request received. Messages: ${messages?.length}, IP: ${ip}`);

    const systemPrompt = `You are ControL-D AI Health Assistant, a fast, expert digital health companion for diabetes care.
${userContext ? `Patient: ${userContext.profile?.name || "Patient"}, Sugar Today: ${JSON.stringify(userContext.todaySugarReadings || [])}` : ""}

Rules:
- Be extremely concise, direct, and fast (max 3-4 bullet points).
- Focus on low-GI foods, South Indian diet (Idli, Pesarattu, Ragi), sugar control, and hydration.
- Always include a brief disclaimer at the end.`;

    if (!apiKey || apiKey.includes("your-api-key")) {
      return NextResponse.json({
        role: "assistant",
        content: getLocalFallbackResponse(messages[messages.length - 1]?.content || ""),
      });
    }

    // Put ultra-fast 8B instant model first for sub-200ms responses
    const models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768"];

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
            temperature: 0.5,
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
        // Try next model
      }
    }

    // Fallback if API fails
    console.warn(`[API FALLBACK] All Groq models failed, returning local fallback response for IP: ${ip}`);
    return NextResponse.json({
      role: "assistant",
      content: getLocalFallbackResponse(messages[messages.length - 1]?.content || ""),
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
  return `### ⚠️ Offline Mode
I am currently running in offline fallback mode because the API key is missing or the connection failed. 

Here is a general health tip:
- **Hydration**: Drink 2.5–3L of water daily.
- **Diet**: Pair carbs with protein & fiber to prevent spikes.
- **Exercise**: A 15-minute walk after meals helps control sugar.

*Please configure the Groq API Key in your environment variables to enable personalized AI responses.*`;
}
