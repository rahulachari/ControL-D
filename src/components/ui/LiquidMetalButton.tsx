"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";

interface LiquidMetalButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function LiquidMetalButton({ children, href, onClick, className = "", type = "button", disabled = false }: LiquidMetalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clickRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = clickRef.current;
    if (!btn) return;

    const createRipple = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.className = "lm-ripple absolute w-5 h-5 rounded-full bg-white/40 pointer-events-none";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.transform = "translate(-50%, -50%) scale(0)";
      ripple.style.animation = "lm-ripple-anim 0.6s ease-out forwards";

      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const tiltX = (y - cy) / cy;
      const tiltY = (cx - x) / cx;
      container.style.transform = `rotateX(${tiltX * 10}deg) rotateY(${tiltY * 10}deg) scale(1.05)`;
    };

    const handleMouseLeave = () => {
      const container = containerRef.current;
      if (container) {
        container.style.transform = "rotateX(0) rotateY(0) scale(1)";
      }
    };

    btn.addEventListener("mousedown", createRipple);
    btn.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      btn.removeEventListener("mousedown", createRipple);
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const content = (
    <div className="lm-wrap inline-flex relative" style={{ perspective: "1000px" }}>
      <div 
        ref={containerRef} 
        className={`lm-container relative inline-flex items-center justify-center rounded-full transition-transform duration-300 ease-out ${className}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="lm-label relative z-30 inline-flex items-center gap-2 text-white px-6 py-3 whitespace-nowrap pointer-events-none" style={{ transform: "translateZ(20px)" }}>
          {children}
        </div>
        <div className="lm-inner-layer absolute inset-0 rounded-full z-20 pointer-events-none" style={{ transform: "translateZ(10px)", transformStyle: "preserve-3d" }}>
          <div className="lm-inner-fill absolute inset-0.5 rounded-full bg-gradient-to-b from-gray-800 to-black"></div>
        </div>
        <div className="lm-shader-layer absolute inset-0 rounded-full z-10 pointer-events-none shadow-[0_0_15px_rgba(66,133,244,0.6)] bg-blue-500" style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }}>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-block" passHref>
        <button ref={clickRef} className="relative cursor-pointer bg-transparent border-none p-0">
          {content}
        </button>
      </Link>
    );
  }

  return (
    <button ref={clickRef} onClick={onClick} type={type} disabled={disabled} className="group relative inline-block bg-transparent border-none p-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
      {content}
    </button>
  );
}
