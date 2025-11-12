import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GlucoseTracker from "@/components/dashboard/GlucoseTracker";
import MealPlanner from "@/components/dashboard/MealPlanner";
import ReminderManager from "@/components/dashboard/ReminderManager";
import AIHealthBot from "@/components/dashboard/AIHealthBot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Utensils, Bell, MessageSquare } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        checkOnboardingStatus(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkOnboardingStatus = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .single();

    if (data && !data.onboarding_completed) {
      navigate("/onboarding");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen pb-8">
      <DashboardHeader userId={session.user.id} />

      <div className="container mx-auto px-4 mt-8">
        <Tabs defaultValue="glucose" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="glucose" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Glucose
            </TabsTrigger>
            <TabsTrigger value="meals" className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Meals
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Reminders
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="glucose">
            <GlucoseTracker userId={session.user.id} />
          </TabsContent>

          <TabsContent value="meals">
            <MealPlanner userId={session.user.id} />
          </TabsContent>

          <TabsContent value="reminders">
            <ReminderManager userId={session.user.id} />
          </TabsContent>

          <TabsContent value="ai">
            <AIHealthBot userId={session.user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;