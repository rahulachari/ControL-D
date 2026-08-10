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
          color: "text-purple-600 bg-purple-100",
        });
      }

      const totalWater = day.water.reduce((s, w) => s + w.amount, 0);
      notifs.push({
        id: "water",
        title: "Hydration Status",
        desc: `Logged ${(totalWater / 1000).toFixed(1)}L today.`,
        type: "water" as const,
        icon: Droplet,
        color: "text-cyan-600 bg-cyan-100",
      });

      const lastSugar = getLatestSugar();
      if (lastSugar) {
        notifs.push({
          id: "sugar",
          title: `Latest Sugar: ${lastSugar.value} mg/dL`,
          desc: `Context: ${lastSugar.context.replace(/_/g, " ")}`,
          type: "sugar" as const,
          icon: Info,
          color: "text-blue-600 bg-blue-100",
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
        <div className="h-16 flex items-center justify-between px-2 w-full gap-2 bg-white/95 backdrop-blur-xl rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden" suppressHydrationWarning>
          
          {/* Left: Patient Info */}
          <div className="flex items-center gap-2 flex-1 min-w-0 relative z-10 pl-2" suppressHydrationWarning>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-1 shadow-sm shrink-0">
               <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            {profile?.name && (
              <div className="flex flex-col" suppressHydrationWarning>
                <span className="text-xs font-semibold text-slate-500 leading-none mb-1">Hello,</span>
                <span className="text-sm font-bold text-slate-900 leading-none truncate max-w-[120px]">{profile.name}</span>
              </div>
            )}
          </div>

          {/* Right: Date, Notifications & Profile Avatar */}
          <div className="flex items-center gap-2 shrink-0 relative z-10 pr-1" suppressHydrationWarning>
            
            {/* Daily Date & Day */}
            {currentDate && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 mr-1">
                <span className="text-xs font-bold text-slate-600">{currentDate}</span>
              </div>
            )}

            {/* Notification Button */}
            <div className="relative" suppressHydrationWarning>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors relative shadow-sm"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <>
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-sky-500 animate-ping border border-white" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-sky-500 border border-white" />
                  </>
                )}
              </button>

              {/* Notification Drawer */}
              {isNotifOpen && (
                <div className="absolute right-0 top-14 w-[calc(100vw-32px)] max-w-xs bg-white backdrop-blur-3xl border border-slate-200 rounded-3xl p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                    <button onClick={() => setIsNotifOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No notifications</p>
                    ) : (
                      notifications.map((n) => {
                        const IconComp = n.icon;
                        return (
                          <div key={n.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 relative">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${n.color}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-slate-900">{n.title}</h5>
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.desc}</p>
                            </div>
                            <button onClick={() => dismissNotif(n.id)} className="text-slate-400 hover:text-slate-700 p-1 shrink-0">
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
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md hover:scale-105 transition-all relative shrink-0 border border-sky-200"
            >
              {initial}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center" suppressHydrationWarning>
                <Settings className="w-2.5 h-2.5 text-slate-600" />
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
