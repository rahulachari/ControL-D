"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Send, X, User, Sparkles, ChevronDown } from "lucide-react";
import { getProfile, getDayData } from "@/lib/healthStore";

import FormattedMessage from "@/components/ui/FormattedMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "What's my recommended water intake?",
  "Suggest a low-GI dinner.",
  "How to lower sugar spike?",
  "Sugar is 220, what to do?",
];

interface FloatingAIChatProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export default function FloatingAIChat({ isOpen: externalIsOpen, onClose, onOpen }: FloatingAIChatProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (externalIsOpen !== undefined) {
      if (isOpen) onClose?.();
      else onOpen?.();
    } else {
      setInternalIsOpen(!isOpen);
    }
  };

  const handleClose = () => {
    if (externalIsOpen !== undefined) {
      onClose?.();
    } else {
      setInternalIsOpen(false);
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi, I'm your AI Clinical Companion. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!queryText) setInput("");
    setIsLoading(true);

    const profile = getProfile();
    const dayData = getDayData();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          userContext: {
            profile,
            todaySugarReadings: dayData.sugar,
            todayWater: dayData.water.reduce((s, w) => s + w.amount, 0),
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...updatedMessages, { role: "assistant", content: data.content }]);
      } else {
        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: "I am having trouble connecting right now. Please try asking again!",
          },
        ]);
      }
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "### ⚠️ Offline Mode (Local Clinical Knowledge)\nNetwork issue detected. Please check your connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-[85px] right-3 lg:bottom-8 lg:right-8 z-[90] flex flex-col items-end pointer-events-auto" suppressHydrationWarning>
      
      {/* Floating Popup Window */}
      {isOpen && (
        <div className="fixed left-3 right-3 bottom-[145px] lg:absolute lg:left-auto lg:right-0 lg:bottom-full lg:mb-4 lg:w-[400px] h-[calc(100vh-200px)] lg:h-[calc(100vh-140px)] max-h-[550px] animate-in fade-in slide-in-from-bottom-4 duration-300 z-[95] shadow-2xl">
          <div className="flex flex-col h-full bg-[#131314]/95 backdrop-blur-3xl rounded-[24px] overflow-hidden border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            
            {/* Popup Header */}
            <div className="px-5 py-4 bg-[#131314]/90 backdrop-blur-md border-b border-[#28292a] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#3b82f6] to-[#8ab4f8] text-white shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-sans font-medium flex items-center gap-1.5 text-white">
                    Agentic AI Assistant
                  </h4>
                  <span className="text-[11px] text-zinc-400">Clinical Knowledge & Support</span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 scrollbar-thin text-[13px] sm:text-sm relative bg-transparent">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 w-full ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-tr from-[#3b82f6] to-[#8ab4f8] text-white mt-1 shadow-md">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-zinc-800 text-zinc-100 px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-md"
                        : "text-zinc-200"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <FormattedMessage content={msg.content} />
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-tr from-[#3b82f6] to-[#8ab4f8] text-white animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-zinc-400 animate-pulse text-[13px]">Thinking...</div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Bottom Input Area */}
            <div className="bg-[#131314]/90 backdrop-blur-md shrink-0 border-t border-[#28292a] flex flex-col gap-2 p-3 sm:p-4">
              
              {/* Quick Prompts */}
              <div className="overflow-x-auto flex gap-2 no-scrollbar pb-1">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 text-[11px] font-medium whitespace-nowrap transition-colors border border-white/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2 relative bg-white/5 rounded-[24px] border border-white/10 focus-within:border-zinc-500 transition-colors px-1 py-1"
              >
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 max-h-32 bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none resize-none py-3 px-4 no-scrollbar"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 rounded-full bg-zinc-200 hover:bg-white text-[#131314] flex items-center justify-center disabled:opacity-30 disabled:hover:bg-zinc-200 transition-all shrink-0 m-1"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Floating Toggle Button (Framer Liquid Glass Theme) */}
      <div 
        onClick={handleToggle}
        className="hidden lg:flex group items-center gap-2 px-1.5 pr-4 py-1.5 rounded-full cursor-pointer select-none transition-all duration-500 z-[96] relative shadow-[0_16px_40px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(255,255,255,0.1)] backdrop-blur-3xl bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/20"
      >
        {/* Subtle Chromatic Edge Light on Hover */}
        <div className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,100,200,0.15) 30%, rgba(100,200,255,0.15) 70%, rgba(255,255,255,0) 100%)', mixBlendMode: 'plus-lighter' }} />

        {/* 3D Chromatic Sphere Icon Container */}
        <div className="relative w-11 h-11 rounded-full flex items-center justify-center shadow-[inset_0_-3px_8px_rgba(0,0,0,0.8),inset_0_2px_6px_rgba(255,255,255,0.9),0_6px_16px_rgba(0,0,0,0.4)] bg-[#1a1a1c] overflow-hidden z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/40 via-transparent to-blue-500/40 opacity-70 mix-blend-color-dodge" />
          <div className="absolute -top-[10%] left-[15%] right-[15%] h-[40%] bg-white/60 rounded-full blur-[1px] transform opacity-80" />
          
          <svg width="0" height="0">
            <linearGradient id="sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop stopColor="#ff6b4a" offset="10%" />
              <stop stopColor="#4aa3ff" offset="90%" />
            </linearGradient>
          </svg>
          <Sparkles className="w-5 h-5 relative z-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" style={{ stroke: "url(#sparkle-grad)", fill: "url(#sparkle-grad)" }} />
        </div>

        <span className="text-white font-medium text-[17px] tracking-tight drop-shadow-md ml-1.5 relative z-10">Ask agents</span>
        <ChevronDown className={`w-5 h-5 text-white transition-transform duration-500 relative z-10 opacity-70 ml-1 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
      </div>
    </div>
  );
}
