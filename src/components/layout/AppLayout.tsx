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

  if (isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10 p-4" suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return (
    <>
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="lg:pl-64 pl-0 flex flex-col min-h-screen relative z-10 w-full min-w-0 overflow-x-hidden" suppressHydrationWarning>
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0" suppressHydrationWarning>
          {children}
        </main>
      </div>
      <WaterReminderToast />
      <GlobalMedAlarmNotifier />
      <FloatingAIChat />
    </>
  );
}
