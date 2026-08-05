"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, Droplet, Utensils, Home, LogOut, X,
  Dumbbell, Pill, Moon, BarChart3, Calendar, AlertTriangle, FileText
} from "lucide-react";
import PillNav from "@/components/ui/PillNav";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Home, color: "text-zinc-400" },
  { href: "/glucose", label: "Glucose", icon: Activity, color: "text-rose-500" },
  { href: "/water", label: "Hydration", icon: Droplet, color: "text-blue-500" },
  { href: "/meals", label: "Diet Plan", icon: Utensils, color: "text-emerald-500" },
  { href: "/workout", label: "Workout", icon: Dumbbell, color: "text-amber-500" },
  { href: "/meds", label: "Medication", icon: Pill, color: "text-pink-500" },
  { href: "/sleep", label: "Sleep", icon: Moon, color: "text-purple-400" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, color: "text-cyan-400" },
  { href: "/calendar", label: "Calendar", icon: Calendar, color: "text-violet-400" },
  { href: "/reports", label: "Reports", icon: FileText, color: "text-teal-400" },
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
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        suppressHydrationWarning
        className={`w-64 h-screen fixed left-0 top-0 z-50 flex flex-col p-3 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl h-full shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden p-4" suppressHydrationWarning>
          
          {/* Header Logo */}
          <div className="pb-4 border-b border-zinc-800/80 flex items-center justify-between shrink-0" suppressHydrationWarning>
            <Link href="/" onClick={onClose} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform border border-zinc-800" suppressHydrationWarning>
                <img src="/logo.png" alt="ControL-D Logo" className="w-full h-full object-cover" />
              </div>
              <div suppressHydrationWarning>
                <span className="font-heading font-extrabold text-base text-white block leading-none tracking-tight">ControL-D</span>
                <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mt-1 block">AI Health Portal</span>
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
              baseColor="#ffffff"
              pillColor="rgba(24, 24, 27, 0.8)"
              pillTextColor="#e4e4e7"
              hoveredPillTextColor="#000000"
            />
          </nav>

          {/* Sign Out Button */}
          <div className="pt-3 border-t border-zinc-800/80 shrink-0" suppressHydrationWarning>
            <Link
              href="/login"
              onClick={() => {
                if (typeof window !== "undefined") localStorage.removeItem("isLoggedIn");
                if (onClose) onClose();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all text-xs font-bold border border-transparent hover:border-zinc-700"
            >
              <LogOut className="w-4 h-4 text-zinc-400" /> Sign Out
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
