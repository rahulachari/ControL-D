"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Send, User, Sparkles, RefreshCw, AlertCircle, Heart, Lightbulb } from "lucide-react";
import { getProfile, getDayData } from "@/lib/healthStore";
import FormattedMessage from "@/components/ui/FormattedMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "What is my recommended daily water target?",
  "Suggest a low-GI South Indian breakfast.",
  "How can I reduce post-meal sugar spikes?",
  "What should I do if my sugar is 220 mg/dL?",
  "Best exercises for Type 2 Diabetes?",
];

export default function AIHealthBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your **ControL-D AI Health Assistant** powered by advanced medical LLM models. Ask me anything about diabetes management, South Indian nutrition, blood sugar readings, or exercise routines!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
            content: "I'm having trouble connecting to the AI server right now. Please make sure your internet is connected or try asking again in a moment!",
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
    <div className="bg-gradient-to-br from-[#727578]/15 via-[#121421]/90 to-[#121421] backdrop-blur-xl border border-[#727578]/30 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col h-[600px] sm:h-[650px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#727578]/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#194793] text-white flex items-center justify-center shadow-lg shadow-[#121421] border border-[#727578]/40 shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-heading font-black text-[#194793] [text-shadow:1px_1px_0px_#121421] flex items-center gap-2 truncate">
              ControL-D AI Assistant
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#194793] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#194793]"></span>
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400 font-bold tracking-wide truncate">Powered by Groq Cloud & LLM Medical Knowledge</p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                role: "assistant",
                content: "Chat reset. How can I assist you with your health today?",
              },
            ])
          }
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#121421] transition-colors shrink-0"
          title="Reset Chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 sm:gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-md ${
                msg.role === "user"
                  ? "bg-[#194793] text-white border border-[#727578]/40"
                  : "bg-[#121421] text-[#194793] border border-[#727578]/40"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[82%] px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#194793] text-white rounded-tr-none shadow-md font-medium"
                  : "bg-[#121421] border border-[#727578]/40 text-zinc-200 rounded-tl-none shadow-sm font-medium"
              }`}
            >
              {msg.role === "user" ? (
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              ) : (
                <FormattedMessage content={msg.content} />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#121421] border border-[#727578]/40 text-[#194793] flex items-center justify-center">
              <Bot className="w-4 h-4 animate-bounce text-[#194793]" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[#121421] border border-[#727578]/40 text-xs text-zinc-400 font-bold flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#194793] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#194793] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#194793] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              Analyzing medical context...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="py-2.5 overflow-x-auto flex gap-2 no-scrollbar border-t border-[#727578]/30 bg-[#121421]/50 rounded-xl px-1">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full bg-[#121421] hover:bg-[#194793] hover:text-white text-zinc-300 text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 border border-[#727578]/40 shrink-0"
          >
            <Lightbulb className="w-3 h-3 text-[#194793]" /> {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 pt-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about diet, glucose, medications..."
          disabled={isLoading}
          className="flex-1 min-w-0 px-4 py-3 rounded-2xl bg-[#121421] border border-[#727578]/40 outline-none text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#194793] transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-5 py-3 rounded-2xl bg-[#194793] hover:bg-[#194793]/90 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#121421] disabled:opacity-50 transition-all flex items-center justify-center border border-[#727578]/40 shrink-0"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
}
