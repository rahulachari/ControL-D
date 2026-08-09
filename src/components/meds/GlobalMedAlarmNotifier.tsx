"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Pill, Bell, VolumeX, CheckCircle, Clock, X, Volume2 } from "lucide-react";
import { getDayData, saveDayData, type MedEntry } from "@/lib/healthStore";
import { speakMedicationAlert, startRepeatingVoiceAlert, stopSpeech } from "@/lib/speechSynthesis";
import BorderGlow from "@/components/ui/BorderGlow";

const MONO_GLOW = {
  backgroundColor: "#09090b",
  glowColor: "0 0 100",
  colors: ["#ffffff", "#e4e4e7", "#a1a1aa"],
  borderRadius: 24,
};

function format12Hour(time24: string): string {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return time24;
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, "0")}:${mStr || "00"} ${period}`;
}

export default function GlobalMedAlarmNotifier() {
  const [alarmMed, setAlarmMed] = useState<MedEntry | null>(null);
  const triggeredAlarmsRef = useRef<Set<string>>(new Set());

  // Register Service Worker and request desktop notification permissions
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => null);
    }
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => null);
      }
    }
  }, []);

  // Background keep-awake hack to prevent JS timer throttling on mobile/locked screen
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Tiny silent wav base64
    const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
    audio.loop = true;
    audio.volume = 0.01;
    
    const unlockAudio = () => {
      audio.play().catch(() => {});
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);

    return () => {
      audio.pause();
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  // Offline Notification Triggers (Android/Chrome only)
  useEffect(() => {
    const syncOffline = async () => {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("Notification" in window) || Notification.permission !== "granted") return;
      // @ts-ignore
      if (!('showTrigger' in Notification.prototype)) return;
      
      try {
        const registration = await navigator.serviceWorker.ready;
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        const day = getDayData(todayStr);
        
        day.meds.forEach(med => {
          if (med.status !== "pending") return;
          const [hStr, mStr] = med.scheduledTime.split(":");
          const targetDate = new Date();
          targetDate.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);
          
          if (targetDate.getTime() > Date.now()) {
            const alarmKey = `offline_${todayStr}_${med.id}`;
            // @ts-ignore
            registration.showNotification(`⏰ Medication: ${med.name}`, {
              tag: alarmKey,
              body: `Time to take ${med.name} (${med.dosage}) - ${format12Hour(med.scheduledTime)}`,
              icon: "/logo.png",
              requireInteraction: true,
              // @ts-ignore
              showTrigger: new window.TimestampTrigger(targetDate.getTime())
            }).catch(() => {});
          }
        });
      } catch (e) {
        console.warn("Offline trigger error:", e);
      }
    };
    
    syncOffline();
    const interval = setInterval(syncOffline, 5 * 60 * 1000); // Re-sync every 5 mins
    return () => clearInterval(interval);
  }, []);

  const stopAlarm = useCallback(() => {
    stopSpeech();
  }, []);

  const playAlarm = useCallback((med?: MedEntry) => {
    stopAlarm();

    if (med) {
      startRepeatingVoiceAlert(med.name, med.dosage, med.beforeAfterFood);
    }
  }, [stopAlarm]);

  // App-wide Alarm Monitoring Loop
  const checkAlarms = useCallback(() => {
    if (typeof window === "undefined") return;
    const now = new Date();
    const currentHHMM = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const todayStr = now.toISOString().split("T")[0];

    const day = getDayData(todayStr);

    // If currently ringing med was deleted or marked taken, stop alarm
    if (alarmMed) {
      const stillExists = day.meds.find((m) => m.id === alarmMed.id && m.status === "pending");
      if (!stillExists) {
        stopAlarm();
        setAlarmMed(null);
      }
    }

    day.meds.forEach((med) => {
      if (med.status === "pending" && med.scheduledTime === currentHHMM) {
        const alarmKey = `${todayStr}_${med.id}_${med.scheduledTime}`;

        if (!triggeredAlarmsRef.current.has(alarmKey)) {
          triggeredAlarmsRef.current.add(alarmKey);
          setAlarmMed(med);
          playAlarm(med);

          // Desktop System Notification
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(`⏰ Medication Alarm: ${med.name}`, {
                body: `Time to take ${med.name} (${med.dosage}) - ${format12Hour(med.scheduledTime)}`,
                icon: "/logo.png",
                tag: alarmKey,
                requireInteraction: true,
              });
            } catch (e) {
              console.warn("Desktop notification error:", e);
            }
          }
        }
      }
    });
  }, [alarmMed, playAlarm, stopAlarm]);

  useEffect(() => {
    const interval = setInterval(checkAlarms, 6000);
    checkAlarms();
    return () => clearInterval(interval);
  }, [checkAlarms]);

  const handleMarkTaken = (medId: string) => {
    stopAlarm();
    const day = getDayData();
    const med = day.meds.find((m) => m.id === medId);
    if (med) {
      med.status = "taken";
      med.takenAt = new Date().toISOString();
      if (med.remaining && med.remaining > 0) med.remaining--;
      saveDayData(day);
    }
    setAlarmMed(null);
  };

  const handleSnooze = (medId: string) => {
    stopAlarm();
    const day = getDayData();
    const med = day.meds.find((m) => m.id === medId);
    if (med) {
      med.status = "snoozed";
      saveDayData(day);

      // Reschedule 10 minutes later
      setTimeout(() => {
        const resetDay = getDayData();
        const resetMed = resetDay.meds.find((m) => m.id === medId);
        if (resetMed && resetMed.status === "snoozed") {
          resetMed.status = "pending";
          saveDayData(resetDay);
          setAlarmMed(resetMed);
          playAlarm(resetMed);
        }
      }, 10 * 60 * 1000);
    }
    setAlarmMed(null);
  };

  const handleDismiss = () => {
    stopAlarm();
    setAlarmMed(null);
  };

  if (!alarmMed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="w-full max-w-md animate-bounce-short">
        <BorderGlow {...MONO_GLOW} className="w-full border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.4)]">
          <div className="p-4 sm:p-6 text-center space-y-5" suppressHydrationWarning>
            
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20 animate-pulse">
              <Bell className="w-8 h-8 text-rose-400 animate-spin-slow" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-black uppercase tracking-wider mb-2">
                ⏰ Alarm Ringing Now
              </span>
              <h2 className="text-2xl font-heading font-black text-white tracking-tight">
                {alarmMed.name}
              </h2>
              <p className="text-sm font-bold text-zinc-300 mt-1">
                Dosage: <span className="text-white">{alarmMed.dosage}</span> ({alarmMed.beforeAfterFood})
              </p>
              <p className="text-xs font-bold text-zinc-400 mt-1">
                Scheduled Time: <span className="text-white">{format12Hour(alarmMed.scheduledTime)}</span>
              </p>
            </div>

            {/* Voice Replay Button */}
            <button
              onClick={() => speakMedicationAlert(alarmMed.name, alarmMed.dosage, alarmMed.beforeAfterFood)}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" /> Replay Loud Voice Alert
            </button>

            <div className="pt-1 flex flex-col gap-2.5">
              <button
                onClick={() => handleMarkTaken(alarmMed.id)}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" /> Mark as Taken
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleSnooze(alarmMed.id)}
                  className="flex-1 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-amber-400" /> Snooze 10m
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-rose-400 hover:text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <VolumeX className="w-4 h-4" /> Stop Alarm
                </button>
              </div>
            </div>

          </div>
        </BorderGlow>
      </div>
    </div>
  );
}
