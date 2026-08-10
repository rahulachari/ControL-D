"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, Droplet, Utensils, Home, LogOut, X,
  Dumbbell, Pill, Moon, BarChart3, Calendar, AlertTriangle, FileText,
  Search, Maximize, Inbox, Menu, ChevronDown, CheckCircle2,
  SlidersHorizontal, Edit, Sparkles
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

const FAVORITES = [
  { href: "/", label: "Overview", icon: CheckCircle2, color: "text-emerald-500" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, color: "text-yellow-500" },
  { href: "/calendar", label: "Calendar", icon: Calendar, color: "text-orange-500" },
  { href: "/reports", label: "Reports", icon: FileText, color: "text-indigo-400" },
];

const HEALTH = [
  { href: "/glucose", label: "Glucose", icon: Activity, color: "text-blue-500" },
  { href: "/water", label: "Hydration", icon: Droplet, color: "text-cyan-400" },
  { href: "/meals", label: "Diet Plan", icon: Utensils, color: "text-orange-400" },
  { href: "/workout", label: "Workout", icon: Dumbbell, color: "text-purple-500" },
  { href: "/meds", label: "Medication", icon: Pill, color: "text-emerald-400" },
  { href: "/sleep", label: "Sleep", icon: Moon, color: "text-indigo-500" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  aiChatOpen?: boolean;
  onAIToggle?: () => void;
}

export default function Sidebar({ isOpen = false, onClose, onOpen, aiChatOpen, onAIToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* --- DESKTOP SIDEBAR --- */}
      <aside
        suppressHydrationWarning
        className={`hidden lg:flex w-64 h-screen fixed left-0 top-0 z-50 flex-col p-3 transition-transform duration-300 ease-in-out`}
      >
        <div className="bg-[#121421]/95 backdrop-blur-2xl border border-[#727578]/30 rounded-3xl h-full shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden p-4">
          
          <div className="pb-4 border-b border-[#727578]/30 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform border border-[#727578]/40 shadow-[0_4px_15px_rgba(25,71,147,0.4)] animate-[float_3s_ease-in-out_infinite]" style={{ transformStyle: 'preserve-3d', perspective: '500px' }}>
                <img src="/logo.png" alt="ControL-D Logo" className="w-full h-full object-cover transition-transform group-hover:-rotate-y-12" />
              </div>
              <div className="animate-[float_3s_ease-in-out_infinite_0.2s]">
                <span className="font-heading font-black text-base bg-gradient-to-r from-[#e8e8e8] via-[#b0b0b0] to-[#8a8a8a] bg-clip-text text-transparent block leading-none tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">ControL-D</span>
                <span className="text-[9px] text-[#194793] uppercase tracking-widest font-extrabold mt-1 block drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">AI Health Portal</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 py-3 flex flex-col min-h-0 overflow-hidden">
            <PillNav
              items={NAV_ITEMS}
              activeHref={pathname}
              onItemClick={onClose}
              baseColor="rgba(25, 71, 147, 0.15)"
              pillColor="transparent"
              pillTextColor="#727578"
              hoveredPillTextColor="#ffffff"
            />
          </nav>

          <div className="pt-3 border-t border-[#727578]/30 shrink-0">
            <Link
              href="/login"
              onClick={() => {
                if (typeof window !== "undefined") localStorage.removeItem("isLoggedIn");
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-full text-zinc-400 hover:text-white hover:bg-[#727578]/20 transition-all text-xs font-bold border border-transparent hover:border-[#727578]/40"
            >
              <LogOut className="w-4 h-4 text-zinc-400" /> Sign Out
            </Link>
          </div>
        </div>
      </aside>

      {/* --- MOBILE SIDEBAR (Linear Style Bottom Sheet) --- */}
      <aside
        className={`lg:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col bg-[#0e0e0e] text-zinc-300 rounded-t-[2.5rem] transition-transform duration-500 shadow-[0_-8px_40px_rgba(0,0,0,0.8)] h-[90vh] pb-24 border-t border-white/5 ${
          isOpen ? "translate-y-0" : "translate-y-[100%]"
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center p-1">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-white text-lg flex items-center gap-2">
                ControL-D
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </span>
            </div>
            <button className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {/* Favorites Group */}
          <div className="mb-8">
            <div className="text-[11px] font-semibold text-zinc-500 mb-3 uppercase tracking-wider px-2">Favorites</div>
            <div className="space-y-1">
              {FAVORITES.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800/50'}`}
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Health Group */}
          <div className="mb-8">
            <div className="text-[11px] font-semibold text-zinc-500 mb-3 uppercase tracking-wider px-2">Health Tracking</div>
            <div className="space-y-1 relative before:absolute before:left-[19px] before:top-6 before:bottom-6 before:w-[1px] before:bg-zinc-800/80">
              {HEALTH.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative z-10 ${isActive ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800/50'}`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center bg-[#0e0e0e]">
                      <item.icon className={`w-[14px] h-[14px] ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mb-8">
            <Link
              href="/emergency"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 text-rose-500"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Emergency</span>
            </Link>
          </div>
          
          <div className="mb-8 border-t border-white/5 pt-4">
             <Link
              href="/login"
              onClick={() => {
                if (typeof window !== "undefined") localStorage.removeItem("isLoggedIn");
                if (onClose) onClose();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 text-zinc-400"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* --- MOBILE FLOATING BOTTOM NAV (Apple Liquid Glass Theme + Chromatic) --- */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 bg-black/40 backdrop-blur-[32px] saturate-[180%] p-1.5 rounded-full border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] w-auto min-w-[260px] justify-between transition-all duration-300 group overflow-hidden">
        
        {/* Subtle Chromatic Edge Light */}
        <div className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,100,200,0.15) 30%, rgba(100,200,255,0.15) 70%, rgba(255,255,255,0) 100%)', mixBlendMode: 'plus-lighter' }} />

        <Link href="/" onClick={() => onClose && onClose()} className={`p-3 rounded-full transition-colors flex items-center justify-center relative z-10 ${pathname === '/' && !isOpen ? 'bg-white/20 text-white shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/10'}`}>
          <Home className={`w-5 h-5 ${pathname === '/' && !isOpen ? 'fill-current' : ''}`} />
        </Link>
        <Link href="/analytics" onClick={() => onClose && onClose()} className={`p-3 rounded-full transition-colors flex items-center justify-center relative z-10 ${pathname === '/analytics' && !isOpen ? 'bg-white/20 text-white shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/10'}`}>
          <Inbox className={`w-5 h-5 ${pathname === '/analytics' && !isOpen ? 'fill-current' : ''}`} />
        </Link>
        
        {/* Toggle Menu Button */}
        <button 
          onClick={isOpen ? onClose : onOpen} 
          className={`p-3 rounded-full transition-colors flex items-center justify-center relative z-10 ${isOpen ? 'bg-white/20 text-white shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/10'}`}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
        
        {/* Calendar Button (Replacing Sliders) */}
        <Link href="/calendar" onClick={() => onClose && onClose()} className={`p-3 rounded-full transition-colors flex items-center justify-center relative z-10 ${pathname === '/calendar' && !isOpen ? 'bg-white/20 text-white shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-white/10'}`}>
          <Calendar className={`w-5 h-5 ${pathname === '/calendar' && !isOpen ? 'fill-current' : ''}`} />
        </Link>
        
        {/* AI Chat Toggle Button (3D Chromatic Sphere) */}
        <button 
          onClick={() => { onAIToggle?.(); onClose?.(); }}
          className="relative w-[44px] h-[44px] rounded-full flex items-center justify-center shadow-[inset_0_-3px_8px_rgba(0,0,0,0.8),inset_0_2px_6px_rgba(255,255,255,0.9),0_4px_12px_rgba(0,0,0,0.4)] bg-[#1a1a1c] overflow-hidden z-10 shrink-0 border border-white/10 ml-1"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/40 via-transparent to-blue-500/40 opacity-70 mix-blend-color-dodge" />
          <div className="absolute -top-[10%] left-[15%] right-[15%] h-[40%] bg-white/60 rounded-full blur-[1px] transform opacity-80" />
          
          <svg width="0" height="0">
            <linearGradient id="sparkle-grad-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop stopColor="#ff6b4a" offset="10%" />
              <stop stopColor="#4aa3ff" offset="90%" />
            </linearGradient>
          </svg>
          <Sparkles className="w-5 h-5 relative z-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" style={{ stroke: "url(#sparkle-grad-mobile)", fill: "url(#sparkle-grad-mobile)" }} />
        </button>
      </div>
    </>
  );
}

