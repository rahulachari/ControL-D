"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, Droplet, Utensils, Home, LogOut, X,
  Dumbbell, Pill, Moon, BarChart3, Calendar, AlertTriangle, FileText
} from "lucide-react";
import PillNav from "@/components/ui/PillNav";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Home, color: "text-[#194793]" },
  { href: "/glucose", label: "Glucose", icon: Activity, color: "text-[#194793]" },
  { href: "/water", label: "Hydration", icon: Droplet, color: "text-[#194793]" },
  { href: "/meals", label: "Diet Plan", icon: Utensils, color: "text-[#194793]" },
  { href: "/workout", label: "Workout", icon: Dumbbell, color: "text-[#194793]" },
  { href: "/meds", label: "Medication", icon: Pill, color: "text-[#194793]" },
  { href: "/sleep", label: "Sleep", icon: Moon, color: "text-[#194793]" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, color: "text-[#194793]" },
  { href: "/calendar", label: "Calendar", icon: Calendar, color: "text-[#194793]" },
  { href: "/reports", label: "Reports", icon: FileText, color: "text-[#194793]" },
  { href: "/emergency", label: "Emergency", icon: AlertTriangle, color: "text-rose-500" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#121421]/80 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        suppressHydrationWarning
        className={`w-64 h-screen fixed left-0 top-0 z-50 flex flex-col p-3 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="bg-[#121421]/95 backdrop-blur-2xl border border-[#727578]/30 rounded-3xl h-full shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden p-4" suppressHydrationWarning>
          
          {/* Header Logo */}
          <div className="pb-4 border-b border-[#727578]/30 flex items-center justify-between shrink-0" suppressHydrationWarning>
            <Link href="/" onClick={onClose} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform border border-[#727578]/40" suppressHydrationWarning>
                <img src="/logo.png" alt="ControL-D Logo" className="w-full h-full object-cover" />
              </div>
              <div suppressHydrationWarning>
                <span className="font-heading font-black text-base bg-gradient-to-r from-[#e8e8e8] via-[#b0b0b0] to-[#8a8a8a] bg-clip-text text-transparent block leading-none tracking-tight">ControL-D</span>
                <span className="text-[9px] text-[#727578] uppercase tracking-widest font-bold mt-1 block">AI Health Portal</span>
              </div>
            </Link>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* PillNav Navigation - Fills Space Evenly */}
          <nav className="flex-1 py-3 flex flex-col min-h-0 overflow-hidden">
            <PillNav
              items={NAV_ITEMS}
              activeHref={pathname}
              onItemClick={onClose}
              baseColor="#194793"
              pillColor="rgba(114, 117, 120, 0.2)"
              pillTextColor="#e4e4e7"
              hoveredPillTextColor="#ffffff"
            />
          </nav>

          {/* Sign Out Button */}
          <div className="pt-3 border-t border-[#727578]/30 shrink-0" suppressHydrationWarning>
            <Link
              href="/login"
              onClick={() => {
                if (typeof window !== "undefined") localStorage.removeItem("isLoggedIn");
                if (onClose) onClose();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-full text-zinc-400 hover:text-white hover:bg-[#727578]/20 transition-all text-xs font-bold border border-transparent hover:border-[#727578]/40"
            >
              <LogOut className="w-4 h-4 text-zinc-400" /> Sign Out
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
