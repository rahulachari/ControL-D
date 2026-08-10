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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        />
      )}

      {/* --- MENU BOTTOM SHEET --- */}
      <aside
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white text-slate-700 rounded-t-[2.5rem] transition-transform duration-500 shadow-[0_-8px_40px_rgba(0,0,0,0.08)] h-[85vh] pb-24 border-t border-slate-100 ${
          isOpen ? "translate-y-0" : "translate-y-[100%]"
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-1 shadow-sm">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-slate-900 text-lg flex items-center gap-2">
                ControL-D
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </span>
            </div>
            <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {/* Favorites Group */}
          <div className="mb-8">
            <div className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider px-2">Favorites</div>
            <div className="space-y-1">
              {FAVORITES.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-sky-50 text-sky-700' : 'hover:bg-slate-50'}`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : item.color}`} />
                    <span className={`text-sm font-semibold ${isActive ? 'text-sky-700' : 'text-slate-700'}`}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Health Group */}
          <div className="mb-8">
            <div className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider px-2">Health Tracking</div>
            <div className="space-y-1 relative before:absolute before:left-[19px] before:top-6 before:bottom-6 before:w-[1px] before:bg-slate-200">
              {HEALTH.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative z-10 ${isActive ? 'bg-sky-50 text-sky-700' : 'hover:bg-slate-50'}`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center bg-white shadow-sm rounded-full border border-slate-100">
                      <item.icon className={`w-[14px] h-[14px] ${item.color}`} />
                    </div>
                    <span className={`text-sm font-semibold ${isActive ? 'text-sky-700' : 'text-slate-700'}`}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mb-8">
            <Link
              href="/emergency"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-rose-500"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-semibold">Emergency</span>
            </Link>
          </div>
          
          <div className="mb-8 border-t border-slate-100 pt-4">
             <Link
              href="/login"
              onClick={() => {
                if (typeof window !== "undefined") localStorage.removeItem("isLoggedIn");
                onClose();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-500"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Sign Out</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* --- FLOATING BOTTOM PILL NAV (Minimal Light Theme) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 bg-white/95 backdrop-blur-xl p-1.5 rounded-full border border-slate-200 shadow-[0_16px_40px_rgba(0,0,0,0.06)] w-auto min-w-[280px] justify-between transition-all duration-300">
        
        <Link href="/" onClick={() => onClose()} className={`p-3 rounded-full transition-colors flex items-center justify-center relative z-10 ${pathname === '/' && !isOpen ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}>
          <Home className={`w-6 h-6 ${pathname === '/' && !isOpen ? 'fill-current' : ''}`} />
        </Link>
        <Link href="/analytics" onClick={() => onClose()} className={`p-3 rounded-full transition-colors flex items-center justify-center relative z-10 ${pathname === '/analytics' && !isOpen ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}>
          <Inbox className={`w-6 h-6 ${pathname === '/analytics' && !isOpen ? 'fill-current' : ''}`} />
        </Link>
        
        {/* Toggle Menu Button */}
        <button 
          onClick={isOpen ? onClose : onOpen} 
          className={`p-3 rounded-full transition-colors flex items-center justify-center relative z-10 ${isOpen ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
        </button>
        
        <Link href="/calendar" onClick={() => onClose()} className={`p-3 rounded-full transition-colors flex items-center justify-center relative z-10 ${pathname === '/calendar' && !isOpen ? 'bg-sky-50 text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}>
          <Calendar className={`w-6 h-6 ${pathname === '/calendar' && !isOpen ? 'fill-current' : ''}`} />
        </Link>
        
        {/* AI Chat Toggle Button */}
        <button 
          onClick={() => { onAIToggle?.(); onClose(); }}
          className={`relative w-[50px] h-[50px] rounded-full flex items-center justify-center shadow-sm overflow-hidden z-10 shrink-0 border ml-1 transition-transform active:scale-90 ${aiChatOpen ? 'bg-sky-100 border-sky-200 text-sky-600' : 'bg-gradient-to-tr from-sky-500 to-indigo-500 text-white border-transparent'}`}
        >
          <Sparkles className="w-6 h-6 relative z-10 drop-shadow-sm" />
        </button>
      </div>
    </>
  );
}
