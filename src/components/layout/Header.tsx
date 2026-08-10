"use client";

import { useState, useEffect } from "react";
import { Bell, Settings, Pill, Droplet, X, Info, Sparkles, Scale, Ruler, Calendar } from "lucide-react";
import OnboardingModal, { UserProfile } from "@/components/profile/OnboardingModal";
import { getDayData, getDailyMotivation, getLatestSugar } from "@/lib/healthStore";

export default function Header() {
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

      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
      setCurrentDate(new Date().toLocaleDateString('en-US', options));

      // Generate live notifications
      const day = getDayData();
      const notifs = [];

      const pendingMeds = day.meds.filter((m) => m.status === "pending");
      if (pendingMeds.length > 0) {
        notifs.push({
          id: "meds",
          title: `${pendingMeds.length} Medication(s) Pending`,
          desc: `Next: ${pendingMeds[0].name} at ${pendingMeds[0].scheduledTime}`,
          type: "med" as const,
          icon: Pill,
          color: "text-purple-400 bg-purple-500/10",
        });
      }

      const totalWater = day.water.reduce((s, w) => s + w.amount, 0);
      notifs.push({
        id: "water",
        title: "Hydration Status",
        desc: `Logged ${(totalWater / 1000).toFixed(1)}L today.`,
        type: "water" as const,
        icon: Droplet,
        color: "text-cyan-400 bg-cyan-500/10",
      });

      const lastSugar = getLatestSugar();
      if (lastSugar) {
        notifs.push({
          id: "sugar",
          title: `Latest Sugar: ${lastSugar.value} mg/dL`,
          desc: `Context: ${lastSugar.context.replace(/_/g, " ")}`,
          type: "sugar" as const,
          icon: Info,
          color: "text-blue-400 bg-blue-500/10",
        });
      }

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
      <header className="sticky top-0 z-40 w-full pt-3 px-0 mb-4" suppressHydrationWarning>
        <div className="h-16 flex items-center justify-between px-2 w-full gap-2 bg-[rgba(20,20,25,0.7)] backdrop-blur-[24px] rounded-[24px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden" suppressHydrationWarning>
          
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-50 pointer-events-none" />

          {/* Left: Patient Info */}
          <div className="flex items-center gap-2 flex-1 min-w-0 relative z-10 pl-2" suppressHydrationWarning>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center p-1 shadow-sm shrink-0">
               <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            {profile?.name && (
              <div className="flex flex-col" suppressHydrationWarning>
                <span className="text-xs font-medium text-zinc-400 leading-none mb-1">Hello,</span>
                <span className="text-sm font-bold text-white leading-none truncate max-w-[120px]">{profile.name}</span>
              </div>
            )}
          </div>

          {/* Right: Date, Notifications & Profile Avatar */}
          <div className="flex items-center gap-2 shrink-0 relative z-10 pr-1" suppressHydrationWarning>
            
            {/* Daily Date & Day */}
            {currentDate && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/5 shadow-inner mr-1">
                <span className="text-xs font-semibold text-zinc-300">{currentDate}</span>
              </div>
            )}

            {/* Notification Button */}
            <div className="relative" suppressHydrationWarning>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-10 h-10 rounded-full bg-black/40 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white flex items-center justify-center transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <>
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
                  </>
                )}
              </button>

              {/* Notification Drawer */}
              {isNotifOpen && (
                <div className="absolute right-0 top-14 w-[calc(100vw-32px)] max-w-xs bg-[rgba(20,20,25,0.95)] backdrop-blur-3xl border border-white/10 rounded-3xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <h4 className="text-sm font-bold text-white">Notifications</h4>
                    <button onClick={() => setIsNotifOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-4">No notifications</p>
                    ) : (
                      notifications.map((n) => {
                        const IconComp = n.icon;
                        return (
                          <div key={n.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3 relative">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${n.color}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-white">{n.title}</h5>
                              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{n.desc}</p>
                            </div>
                            <button onClick={() => dismissNotif(n.id)} className="text-zinc-500 hover:text-zinc-300 p-1 shrink-0">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-md hover:scale-105 transition-all relative shrink-0 border border-white/20"
            >
              {initial}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#141419] border border-white/20 flex items-center justify-center" suppressHydrationWarning>
                <Settings className="w-2.5 h-2.5 text-zinc-400" />
              </div>
            </button>
          </div>
        </div>
      </header>

      <OnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
