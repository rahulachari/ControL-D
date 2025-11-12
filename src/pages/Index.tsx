import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Activity, Brain, Calendar, LineChart, Pill, Utensils } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const features = [
    {
      icon: LineChart,
      title: "Glucose Tracking",
      description: "Monitor your blood sugar levels with ease and get insights"
    },
    {
      icon: Utensils,
      title: "AI Meal Planning",
      description: "Personalized meal plans generated based on your health data"
    },
    {
      icon: Pill,
      title: "Medication Reminders",
      description: "Never miss a dose with customizable alarm reminders"
    },
    {
      icon: Activity,
      title: "Activity Monitoring",
      description: "Track your exercise and daily activities effortlessly"
    },
    {
      icon: Brain,
      title: "AI Health Assistant",
      description: "Get instant answers about diabetes management 24/7"
    },
    {
      icon: Calendar,
      title: "Health Reports",
      description: "Comprehensive reports to share with your healthcare provider"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-secondary" />
              <h1 className="text-2xl font-bold gradient-text">ControL-D</h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/auth")}>
                Login
              </Button>
              <Button className="bg-gradient-primary" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            Take Control of Your Diabetes
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Advanced diabetes management powered by AI. Track, plan, and manage your health with precision.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-primary text-white text-lg px-8 py-6"
            onClick={() => navigate("/auth")}
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Powerful Features</h3>
            <p className="text-muted-foreground text-lg">Everything you need to manage diabetes effectively</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-xl hover:shadow-[var(--shadow-glow)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-secondary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 glass-card">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">How It Works</h3>
            <p className="text-muted-foreground text-lg">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Sign Up", desc: "Create your account and complete your health profile" },
              { step: "2", title: "Set Goals", desc: "Input your health data and set personalized targets" },
              { step: "3", title: "Track & Improve", desc: "Monitor progress and get AI-powered recommendations" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-4xl font-bold mb-6">Ready to Transform Your Health?</h3>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users managing their diabetes with confidence
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-primary text-white text-lg px-8 py-6"
            onClick={() => navigate("/auth")}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t glass-card">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 ControL-D. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;