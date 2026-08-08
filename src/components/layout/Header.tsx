"use client";

import { useState, useEffect } from "react";
import { Bell, Settings, Pill, Droplet, X, Info, Sparkles, Menu, Scale, Ruler, Calendar } from "lucide-react";
import OnboardingModal, { UserProfile } from "@/components/profile/OnboardingModal";
import { getDayData, getDailyMotivation, getLatestSugar } from "@/lib/healthStore";
import BorderGlow from "@/components/ui/BorderGlow";

interface HeaderProps {
  onMenuClick?: () => void;
}

const OVERVIEW_GLOW = {
  backgroundColor: "#121421",
  glowColor: "215 71 34",
  colors: ["#194793", "#727578", "#121421"],
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
        <BorderGlow {...OVERVIEW_GLOW} className="w-full">
          <div className="h-16 flex items-center justify-between px-2 sm:px-6 w-full gap-1.5 sm:gap-2 bg-gradient-to-r from-[#727578]/15 via-[#121421] to-[#121421] rounded-[24px] border border-[#727578]/30" suppressHydrationWarning>
            
            {/* Left: Mobile Menu Button & Glowing Patient Info */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0" suppressHydrationWarning>
              {onMenuClick && (
                <button
                  onClick={onMenuClick}
                  className="p-1.5 rounded-2xl bg-[#121421] border border-[#727578]/40 text-[#194793] lg:hidden hover:border-[#194793] transition-all shrink-0"
                  title="Open Navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {profile?.name && (
                <div className="flex items-center gap-1 sm:gap-3 flex-1 min-w-0" suppressHydrationWarning>
                  <span className="text-xs font-semibold text-[#727578] hidden lg:inline shrink-0">Active Patient:</span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#194793] [text-shadow:1px_1px_0px_#121421] truncate max-w-[60px] min-[380px]:max-w-[100px] sm:max-w-none">{profile.name}</span>
                  
                  {/* Glowing Weight & Height Badges - Hidden on mobile to prevent overflow */}
                  <div className="hidden md:flex items-center gap-1.5 shrink-0 ml-1" suppressHydrationWarning>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#121421] text-zinc-200 border border-[#727578]/40 text-xs font-extrabold shadow-sm">
                      <Calendar className="w-3 h-3 text-[#194793]" />
                      {profile.age} yrs
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#194793] text-white border border-[#194793] text-xs font-black shadow-md hover:scale-105 transition-all">
                      <Scale className="w-3 h-3 text-white" />
                      {profile.weight} kg
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#194793] text-white border border-[#194793] text-xs font-black shadow-md hover:scale-105 transition-all">
                      <Ruler className="w-3 h-3 text-white" />
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
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121421] border border-[#727578]/30 shadow-inner mr-1">
                  <Calendar className="w-3.5 h-3.5 text-[#194793]" />
                  <span className="text-xs font-bold text-zinc-300 tracking-wide">{currentDate}</span>
                </div>
              )}

              {/* Notification Button & Drawer */}
              <div className="relative" suppressHydrationWarning>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  title="Notifications"
                  className="p-2 sm:p-2.5 rounded-full bg-[#121421] hover:bg-[#194793] hover:text-white border border-[#727578]/40 text-[#194793] transition-all relative"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <>
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#194793] animate-ping" />
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#194793]" />
                    </>
                  )}
                </button>

                {/* Notification Popover Drawer */}
                {isNotifOpen && (
                  <div className="absolute right-0 top-12 w-72 sm:w-96 bg-[#121421]/95 backdrop-blur-2xl border border-[#727578]/40 rounded-3xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-[#727578]/30 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#194793]" />
                        <h4 className="text-sm font-heading font-extrabold text-[#194793]">Health Notifications</h4>
                      </div>
                      <button onClick={() => setIsNotifOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-4">No notifications</p>
                      ) : (
                        notifications.map((n) => {
                          const IconComp = n.icon;
                          return (
                            <div key={n.id} className="p-3 rounded-2xl bg-[#727578]/10 border border-[#727578]/30 flex items-start gap-3 relative group">
                              <div className="w-8 h-8 rounded-xl bg-[#194793] text-white flex items-center justify-center shrink-0 mt-0.5">
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-bold text-[#194793]">{n.title}</h5>
                                <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">{n.desc}</p>
                              </div>
                              <button onClick={() => dismissNotif(n.id)} className="text-zinc-500 hover:text-zinc-300 p-1">
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

              {/* Edit Profile Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                title="Edit Health Profile"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#194793] border border-[#194793] text-white flex items-center justify-center font-heading font-black text-sm shadow-md hover:scale-105 transition-all relative shrink-0"
              >
                {initial}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#121421] border border-[#727578]/40 flex items-center justify-center" suppressHydrationWarning>
                  <Settings className="w-2.5 h-2.5 text-white" />
                </div>
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
