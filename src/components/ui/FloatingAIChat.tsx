"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Send, X, User, Sparkles, ChevronDown } from "lucide-react";
import { getProfile, getDayData } from "@/lib/healthStore";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "What's my recommended water intake?",
  "Suggest a low-GI South Indian dinner.",
  "How can I lower my post-meal sugar spike?",
  "What to do if sugar is 220 mg/dL?",
];



export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your **ControL-D AI Health Assistant**. Ask me anything about your blood sugar, South Indian nutrition, exercise, or medications!",
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
          content: "Network issue detected. Please check your connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[90] flex flex-col items-end pointer-events-auto" suppressHydrationWarning>
      
      {/* Floating Popup Window */}
      {isOpen && (
        <div className="fixed left-4 right-4 bottom-20 sm:absolute sm:left-auto sm:right-0 sm:bottom-full sm:mb-4 sm:w-[380px] h-[calc(100vh-120px)] max-h-[480px] sm:max-h-[520px] animate-in fade-in slide-in-from-bottom-4 duration-300 z-[95]">
          <div className="flex flex-col h-full bg-zinc-950/95 backdrop-blur-2xl rounded-[24px] overflow-hidden border border-zinc-800 shadow-[0_0_40px_rgba(255,255,255,0.07)]">
            
            {/* Popup Header */}
            <div className="px-5 py-4 bg-zinc-900 border-b border-zinc-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  <Bot className="w-5 h-5" />
                </div>
                  <div>
                    <h4 className="text-sm font-heading font-black flex items-center gap-1.5 text-white">
                      AI Health Coach
                      <Sparkles className="w-3 h-3 text-white animate-pulse" />
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-bold tracking-wide">24/7 Diabetes & Lifestyle Support</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin text-xs relative">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-md ${
                        msg.role === "user"
                          ? "bg-white text-black"
                          : "bg-zinc-800 text-white border border-zinc-700"
                      }`}
                    >
                      {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div
                      className={`max-w-[82%] px-4 py-3 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-white text-black rounded-tr-sm font-medium"
                          : "bg-zinc-900 text-zinc-200 rounded-tl-sm border border-zinc-800 font-medium"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold ml-2">
                    <Bot className="w-4 h-4 text-zinc-400 animate-pulse" />
                    <span>AI Coach thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-4 py-2.5 overflow-x-auto flex gap-2 border-t border-zinc-800 bg-zinc-950 no-scrollbar shrink-0">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-white hover:text-black text-zinc-300 text-[10px] font-bold whitespace-nowrap transition-colors border border-zinc-800"
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
                className="p-3 border-t border-zinc-800 bg-zinc-950 flex gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AI coach a question..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 rounded-2xl bg-white hover:scale-105 text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:hover:scale-100 transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center transition-all duration-300 z-[96] relative"
        title="AI Health Coach"
      >
        <div className="relative flex items-center justify-center" suppressHydrationWarning>
          {isOpen ? (
            <ChevronDown className="w-6 h-6 text-black" />
          ) : (
            <>
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-black border-2 border-white animate-pulse" />
            </>
          )}
        </div>
      </button>
    </div>
  );
}
