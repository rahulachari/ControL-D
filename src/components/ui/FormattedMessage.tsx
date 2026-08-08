"use client";

import React from "react";
import { AlertTriangle, Sparkles } from "lucide-react";

interface FormattedMessageProps {
  content: string;
  className?: string;
}

// Inline parser for **bold**, *italic*, and `code`
function parseInline(text: string): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={idx} className="italic text-slate-600 dark:text-zinc-400">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[11px] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function FormattedMessage({ content, className = "" }: FormattedMessageProps) {
  if (!content) return null;

  // Split by newlines while preserving line structure
  const lines = content.split("\n");

  return (
    <div className={`space-y-1.5 text-xs sm:text-sm leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Offline / Warning Mode Alert Box
        if (trimmed.startsWith("### ⚠️") || trimmed.startsWith("⚠️")) {
          const headingText = trimmed.replace(/^###\s*/, "").replace(/^⚠️\s*/, "");
          return (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-2 my-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-semibold text-xs"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>{headingText || "Offline Fallback Mode"}</span>
            </div>
          );
        }

        // Headings (### , ## , # )
        if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
          const headingText = trimmed.replace(/^#+\s*/, "");
          return (
            <h4
              key={idx}
              className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 pt-1 pb-0.5 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {parseInline(headingText)}
            </h4>
          );
        }

        // Bullet point items (- item or * item)
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const listText = trimmed.replace(/^[-*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <div className="flex-1 text-slate-700 dark:text-zinc-200">
                {parseInline(listText)}
              </div>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <p key={idx} className="text-slate-700 dark:text-zinc-200">
            {parseInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
