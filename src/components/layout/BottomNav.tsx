"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, Droplet, Utensils, Home, LogOut, X,
  Dumbbell, Pill, Moon, BarChart3, Calendar, AlertTriangle, FileText,
  Maximize, Inbox, ChevronDown, CheckCircle2, Edit, Sparkles
} from "lucide-react";

const FAVORITES = [
  { href: "/", label: "Overview", icon: CheckCircle2, color: "text-[#194793]" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, color: "text-[#194793]" },
  { href: "/calendar", label: "Calendar", icon: Calendar, color: "text-[#194793]" },
  { href: "/reports", label: "Reports", icon: FileText, color: "text-[#194793]" },
];

const HEALTH = [
  { href: "/glucose", label: "Glucose", icon: Activity, color: "text-[#194793]" },
  { href: "/water", label: "Hydration", icon: Droplet, color: "text-[#194793]" },
  { href: "/meals", label: "Diet Plan", icon: Utensils, color: "text-[#194793]" },
  { href: "/workout", label: "Workout", icon: Dumbbell, color: "text-[#194793]" },
  { href: "/meds", label: "Medication", icon: Pill, color: "text-[#194793]" },
  { href: "/sleep", label: "Sleep", icon: Moon, color: "text-[#194793]" },
];

interface BottomNavProps {
  aiChatOpen?: boolean;
  onAIToggle?: () => void;
}

export default function BottomNav({ aiChatOpen, onAIToggle }: BottomNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  return (
    <>
      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        />
      )}

      {/* --- MENU BOTTOM SHEET --- */}
      <aside
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-[#0e0e0e]/95 backdrop-blur-3xl text-zinc-300 rounded-t-[2.5rem] transition-transform duration-500 shadow-[0_-8px_40px_rgba(0,0,0,0.8)] h-[85vh] pb-24 border-t border-[#727578]/20 ${
          isOpen ? "translate-y-0" : "translate-y-[100%]"
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#727578]/40 bg-[#121421] flex items-center justify-center p-1 shadow-md">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-heading font-black text-white text-lg flex items-center gap-2">
                ControL-D
                <ChevronDown className="w-4 h-4 text-[#727578]" />
              </span>
            </div>
            <button className="w-9 h-9 rounded-full bg-[#121421] border border-[#727578]/30 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {/* Favorites Group */}
          <div className="mb-8">
            <div className="text-[11px] font-black text-[#194793] mb-3 uppercase tracking-wider px-2">Favorites</div>
            <div className="space-y-1">
              {FAVORITES.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-[#194793] text-white' : 'hover:bg-[#121421] hover:text-white'}`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Health Group */}
          <div className="mb-8">
            <div className="text-[11px] font-black text-[#194793] mb-3 uppercase tracking-wider px-2">Health Tracking</div>
            <div className="space-y-1 relative before:absolute before:left-[19px] before:top-6 before:bottom-6 before:w-[1px] before:bg-[#727578]/30">
              {HEALTH.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative z-10 ${isActive ? 'bg-[#194793] text-white' : 'hover:bg-[#121421] hover:text-white'}`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center bg-[#0e0e0e] shadow-sm rounded-full border border-[#727578]/40">
                      <item.icon className={`w-[14px] h-[14px] ${isActive ? 'text-white' : item.color}`} />
                    </div>
                    <span className="text-sm font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mb-8">
            <Link
              href="/emergency"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-500/10 text-rose-500"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-semibold">Emergency</span>
            </Link>
          </div>
          
          <div className="mb-8 border-t border-[#727578]/20 pt-4">
             <Link
              href="/login"
              onClick={() => {
                if (typeof window !== "undefined") localStorage.removeItem("isLoggedIn");
                onClose();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#121421] text-[#727578]"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Sign Out</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* --- FLOATING BOTTOM PILL NAV (Dark Royal Blue) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 bg-[#121421]/90 backdrop-blur-[32px] saturate-[180%] p-1.5 rounded-full border border-[#727578]/40 shadow-[0_16px_40px_rgba(0,0,0,0.6)] w-auto min-w-[280px] justify-between transition-all duration-300">
        
        <Link href="/" onClick={() => onClose()} className={`p-3 rounded-full transition-colors flex items-center justify-center relative z-10 ${pathname === '/' && !isOpen ? 'bg-[#194793] text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-[#727578]/20'}`}>
          <Home className={`w-6 h-6 ${pathname === '/' && !isOpen ? 'fill-current' : ''}`} />
        </Link>
        <Link href="/analytics" onClick={() => onClose()} className={`p-3 rounded-full transition-colors flex items-center justify-center relative z-10 ${pathname === '/analytics' && !isOpen ? 'bg-[#194793] text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-[#727578]/20'}`}>
          <Inbox className={`w-6 h-6 ${pathname === '/analytics' && !isOpen ? 'fill-current' : ''}`} />
        </Link>
        
        {/* Toggle Menu Button */}
        <button 
          onClick={isOpen ? onClose : onOpen} 
          className={`p-3 rounded-full transition-colors flex items-center justify-center relative z-10 ${isOpen ? 'bg-[#727578]/40 text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-[#727578]/20'}`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
        </button>
        
        <Link href="/calendar" onClick={() => onClose()} className={`p-3 rounded-full transition-colors flex items-center justify-center relative z-10 ${pathname === '/calendar' && !isOpen ? 'bg-[#194793] text-white shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-[#727578]/20'}`}>
          <Calendar className={`w-6 h-6 ${pathname === '/calendar' && !isOpen ? 'fill-current' : ''}`} />
        </Link>
        
        {/* AI Chat Toggle Button */}
        <button 
          onClick={() => { onAIToggle?.(); onClose(); }}
          className={`relative w-[50px] h-[50px] rounded-full flex items-center justify-center shadow-md overflow-hidden z-10 shrink-0 border transition-transform active:scale-90 ${aiChatOpen ? 'bg-white text-[#194793] border-white' : 'bg-[#194793] text-white border-[#194793]'}`}
        >
          <Sparkles className={`w-6 h-6 relative z-10 ${aiChatOpen ? 'fill-current' : ''}`} />
        </button>
      </div>
    </>
  );
}
