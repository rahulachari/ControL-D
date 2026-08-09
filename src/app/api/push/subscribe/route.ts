import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { subscription, userId } = await req.json();

    if (!subscription || !userId) {
      return NextResponse.json(
        { error: "Missing subscription or userId" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: userId,
          subscription: subscription,
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id,subscription" }
      );

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscription Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
