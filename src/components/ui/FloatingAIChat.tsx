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

export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[90] flex flex-col items-end pointer-events-auto" suppressHydrationWarning>
      
      {/* Floating Popup Window */}
      {isOpen && (
        <div className="fixed left-3 right-3 bottom-20 sm:absolute sm:left-auto sm:right-0 sm:bottom-full sm:mb-4 sm:w-[400px] h-[calc(100vh-120px)] max-h-[550px] animate-in fade-in slide-in-from-bottom-4 duration-300 z-[95] shadow-2xl">
          <div className="flex flex-col h-full bg-[#131314] rounded-[24px] overflow-hidden border border-[#28292a] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            
            {/* Popup Header */}
            <div className="px-5 py-4 bg-[#131314] border-b border-[#28292a] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#3b82f6] to-[#8ab4f8] text-white">
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
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-[#28292a] text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 scrollbar-thin text-[13px] sm:text-sm relative bg-[#131314]">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 w-full ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-tr from-[#3b82f6] to-[#8ab4f8] text-white mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-[#28292a] text-zinc-100 px-4 py-2.5 rounded-2xl rounded-tr-sm"
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
            <div className="bg-[#131314] shrink-0 border-t border-[#28292a] flex flex-col gap-2 p-3 sm:p-4">
              
              {/* Quick Prompts */}
              <div className="overflow-x-auto flex gap-2 no-scrollbar pb-1">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-full bg-[#1e1f20] hover:bg-[#28292a] text-zinc-300 text-[11px] font-medium whitespace-nowrap transition-colors border border-[#28292a]"
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
                className="flex items-end gap-2 relative bg-[#1e1f20] rounded-[24px] border border-[#28292a] focus-within:border-zinc-500 transition-colors px-1 py-1"
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

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-800 border border-zinc-700 hover:border-zinc-500 hover:scale-105 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-300 z-[96] relative overflow-hidden"
        title="AI Health Coach"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#3b82f6]/20 to-[#8ab4f8]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center justify-center w-full h-full" suppressHydrationWarning>
          {isOpen ? (
            <ChevronDown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#8ab4f8]" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-zinc-800" />
            </>
          )}
        </div>
      </button>
    </div>
  );
}
