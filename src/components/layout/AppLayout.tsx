"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import FloatingAIChat from "@/components/ui/FloatingAIChat";

import WaterReminderToast from "@/components/water/WaterReminderToast";
import GlobalMedAlarmNotifier from "@/components/meds/GlobalMedAlarmNotifier";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [aiChatOpen, setAiChatOpen] = useState(false);

  if (isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10 p-4 bg-matrix" suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matrix bg-fixed text-slate-900 font-sans overflow-x-hidden flex flex-col pb-28 relative z-10" suppressHydrationWarning>
      <Header />
      <main className="flex-1 px-4 pt-4 w-full max-w-2xl mx-auto flex flex-col" suppressHydrationWarning>
        {children}
      </main>
      <BottomNav 
        aiChatOpen={aiChatOpen}
        onAIToggle={() => setAiChatOpen(!aiChatOpen)}
      />
      <WaterReminderToast />
      <GlobalMedAlarmNotifier />
      <FloatingAIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} onOpen={() => setAiChatOpen(true)} />
    </div>
  );
}
