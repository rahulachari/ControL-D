"use client";

import { useState, useEffect } from "react";
import { Bell, Settings, Pill, Droplet, X, Info, Sparkles, Menu, Scale, Ruler, Calendar } from "lucide-react";
import OnboardingModal, { UserProfile } from "@/components/profile/OnboardingModal";
import { getDayData, getDailyMotivation, getLatestSugar } from "@/lib/healthStore";
import BorderGlow from "@/components/ui/BorderGlow";

interface HeaderProps {
  onMenuClick?: () => void;
}

const MONO_GLOW = {
  backgroundColor: "#09090b",
  glowColor: "0 0 100",
  colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
  borderRadius: 24,
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; desc: string; type: "med" | "water" | "tip" | "sugar"; icon: any; color: string }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userProfile");
      if (saved) {
        try {
          setProfile(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }

      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
      setCurrentDate(new Date().toLocaleDateString('en-US', options));

      // Generate live notifications from current day data
      const day = getDayData();
      const notifs = [];

      // Meds notification
      const pendingMeds = day.meds.filter((m) => m.status === "pending");
      if (pendingMeds.length > 0) {
        notifs.push({
          id: "meds",
          title: `${pendingMeds.length} Medication(s) Pending`,
          desc: `Next: ${pendingMeds[0].name} at ${pendingMeds[0].scheduledTime}`,
          type: "med" as const,
          icon: Pill,
          color: "text-zinc-200 bg-zinc-800",
        });
      } else {
        notifs.push({
          id: "meds_done",
          title: "Medications On Track",
          desc: "All scheduled medications taken so far today!",
          type: "med" as const,
          icon: Pill,
          color: "text-zinc-200 bg-zinc-800",
        });
      }

      // Water notification
      const totalWater = day.water.reduce((s, w) => s + w.amount, 0);
      notifs.push({
        id: "water",
        title: "Hydration Status",
        desc: `Logged ${(totalWater / 1000).toFixed(1)}L today. Stay hydrated!`,
        type: "water" as const,
        icon: Droplet,
        color: "text-zinc-200 bg-zinc-800",
      });

      // Sugar notification
      const lastSugar = getLatestSugar();
      if (lastSugar) {
        notifs.push({
          id: "sugar",
          title: `Latest Sugar: ${lastSugar.value} mg/dL`,
          desc: `Logged context: ${lastSugar.context.replace(/_/g, " ")}`,
          type: "sugar" as const,
          icon: Info,
          color: "text-zinc-200 bg-zinc-800",
        });
      }

      // Daily Motivation
      notifs.push({
        id: "tip",
        title: "Daily Motivation",
        desc: getDailyMotivation(),
        type: "tip" as const,
        icon: Sparkles,
        color: "text-zinc-200 bg-zinc-800",
      });

      setNotifications(notifs);
    }
  }, [isNotifOpen]);

  const handleSave = (updated: UserProfile) => {
    setProfile(updated);
  };

  const dismissNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const initial = mounted && profile?.name ? profile.name.charAt(0).toUpperCase() : "U";

  return (
    <>
      <header className="sticky top-0 z-40 w-full pt-3 px-4 sm:px-6 mb-4" suppressHydrationWarning>
        <BorderGlow {...MONO_GLOW} className="w-full">
          <div className="h-16 flex items-center justify-between px-2 sm:px-6 w-full gap-1.5 sm:gap-2" suppressHydrationWarning>
            
            {/* Left: Mobile Menu Button & Glowing Patient Info */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0" suppressHydrationWarning>
              {onMenuClick && (
                <button
                  onClick={onMenuClick}
                  className="p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white lg:hidden hover:border-white transition-all shrink-0"
                  title="Open Navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {profile?.name && (
                <div className="flex items-center gap-1 sm:gap-3 flex-1 min-w-0" suppressHydrationWarning>
                  <span className="text-xs font-semibold text-zinc-400 hidden lg:inline shrink-0">Active Patient:</span>
                  <span className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[60px] min-[380px]:max-w-[100px] sm:max-w-none">{profile.name}</span>
                  
                  {/* Glowing Weight & Height Badges - Hidden on mobile to prevent overflow */}
                  <div className="hidden md:flex items-center gap-1.5 shrink-0 ml-1" suppressHydrationWarning>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 text-white border border-zinc-700 text-xs font-extrabold shadow-[0_0_12px_rgba(255,255,255,0.15)] hover:border-white transition-all">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      {profile.age} yrs
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-black border border-white text-xs font-black shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-105 transition-all">
                      <Scale className="w-3 h-3 text-black" />
                      {profile.weight} kg
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-black border border-white text-xs font-black shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-105 transition-all">
                      <Ruler className="w-3 h-3 text-black" />
                      {profile.height || 175} cm
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Date, Notifications & Profile Avatar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0" suppressHydrationWarning>
              
              {/* Daily Date & Day */}
              {currentDate && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/50 shadow-inner mr-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-300 tracking-wide">{currentDate}</span>
                </div>
              )}

              {/* Notification Button & Drawer */}
              <div className="relative" suppressHydrationWarning>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  title="Notifications"
                  className="p-2 sm:p-2.5 rounded-full bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-zinc-200 transition-all relative"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <>
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white animate-ping" />
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    </>
                  )}
                </button>

                {/* Notification Popover Drawer */}
                {isNotifOpen && (
                  <div className="absolute right-0 top-12 w-72 sm:w-96 bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-white" />
                        <h4 className="text-sm font-heading font-extrabold text-white">Health Notifications</h4>
                      </div>
                      <button onClick={() => setIsNotifOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-6">No new notifications</p>
                      ) : (
                        notifications.map((n) => {
                          const Icon = n.icon;
                          return (
                            <div key={n.id} className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 relative group">
                              <div className={`w-8 h-8 rounded-xl ${n.color} flex items-center justify-center shrink-0`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 pr-4">
                                <h5 className="text-xs font-bold text-white">{n.title}</h5>
                                <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{n.desc}</p>
                              </div>
                              <button
                                onClick={() => dismissNotif(n.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-white absolute top-2.5 right-2.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar & Edit Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                title="Edit Profile"
                className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all text-xs font-bold text-white shadow-md shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-extrabold text-xs shadow-[0_0_15px_rgba(255,255,255,0.3)] relative shrink-0" suppressHydrationWarning>
                  {initial}
                  <Settings className="w-3 h-3 absolute -bottom-0.5 -right-0.5 bg-zinc-900 text-white rounded-full p-0.5 sm:hidden border border-zinc-700" />
                </div>
                <span className="hidden sm:inline text-white font-extrabold truncate max-w-[80px] md:max-w-none">{profile?.name || "Edit Profile"}</span>
                <Settings className="w-3.5 h-3.5 text-zinc-400 hidden sm:inline shrink-0" />
              </button>
            </div>
          </div>
        </BorderGlow>
      </header>

      <OnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
