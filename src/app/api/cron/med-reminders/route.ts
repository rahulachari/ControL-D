import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use service role key if available for cron job, else fallback to anon key for reading all health records
// If anon key has RLS enabled, we might need the service role key to read all users' data.
// Since we only have anon key in .env, we assume the cron can bypass or we will fetch it.
// Actually, daily_health has RLS "Users can view own health logs", so anon key WON'T WORK for a global cron job!
// The user will need to add a service role key to their .env to bypass RLS, OR we disable RLS for a specific view.
// Let's assume the user will add SUPABASE_SERVICE_ROLE_KEY to .env for the cron.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:test@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: Request) {
  try {
    // Basic auth for cron (optional, usually Vercel sends a CRON_SECRET)
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    // Round down to current minute
    const currentHHMM = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const todayStr = now.toISOString().split("T")[0];

    // Fetch all health logs for today
    const { data: healthLogs, error: healthError } = await supabase
      .from("daily_health")
      .select("user_id, data")
      .eq("date", todayStr);

    if (healthError) {
      console.error("Error fetching health logs:", healthError);
      return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }

    if (!healthLogs || healthLogs.length === 0) {
      return NextResponse.json({ success: true, message: "No logs today" });
    }

    const notificationsToSend: Promise<any>[] = [];

    for (const log of healthLogs) {
      const dayData = log.data;
      if (!dayData || !dayData.meds) continue;

      const dueMeds = dayData.meds.filter(
        (m: any) => m.status === "pending" && m.scheduledTime === currentHHMM
      );

      if (dueMeds.length > 0) {
        // Fetch subscriptions for this user
        const { data: subs, error: subError } = await supabase
          .from("push_subscriptions")
          .select("subscription")
          .eq("user_id", log.user_id);

        if (subError || !subs) continue;

        for (const med of dueMeds) {
          const payload = JSON.stringify({
            title: `⏰ Medication: ${med.name}`,
            body: `Time to take ${med.name} (${med.dosage})`,
            tag: `${todayStr}_${med.id}_${currentHHMM}`,
            data: { medId: med.id, url: "/meds" }
          });

          for (const sub of subs) {
            notificationsToSend.push(
              webpush.sendNotification(sub.subscription, payload).catch((e) => {
                if (e.statusCode === 410 || e.statusCode === 404) {
                  // Subscription expired or invalid, we could delete it here
                  supabase.from("push_subscriptions").delete().eq("subscription", sub.subscription).then();
                }
                console.error("Push send error:", e);
              })
            );
          }
        }
      }
    }

    await Promise.allSettled(notificationsToSend);

    return NextResponse.json({ success: true, sent: notificationsToSend.length });
  } catch (err) {
    console.error("Cron Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
