"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import FloatingAIChat from "@/components/ui/FloatingAIChat";

import WaterReminderToast from "@/components/water/WaterReminderToast";
import GlobalMedAlarmNotifier from "@/components/meds/GlobalMedAlarmNotifier";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  if (isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10 p-4" suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return (
    <>
      <Sidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
        onOpen={() => setMobileSidebarOpen(true)}
        aiChatOpen={aiChatOpen}
        onAIToggle={() => setAiChatOpen(!aiChatOpen)}
      />
      <div className="lg:pl-64 pl-0 flex flex-col min-h-screen relative z-10 w-full min-w-0 overflow-x-clip" suppressHydrationWarning>
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 px-2 sm:px-6 pt-0 pb-6 w-full min-w-0" suppressHydrationWarning>
          {children}
        </main>
      </div>
      <WaterReminderToast />
      <GlobalMedAlarmNotifier />
      <FloatingAIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} onOpen={() => setAiChatOpen(true)} />
    </>
  );
}
