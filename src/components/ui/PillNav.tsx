"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import "./PillNav.css";

export interface PillNavItem {
  href: string;
  label: string;
  icon?: React.ElementType;
  color?: string;
}

interface PillNavProps {
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onItemClick?: () => void;
}

export default function PillNav({
  items = [],
  activeHref = "/",
  className = "",
  ease = "power3.easeOut",
  baseColor = "#2563eb",
  pillColor = "rgba(255, 255, 255, 0.06)",
  hoveredPillTextColor = "#ffffff",
  pillTextColor = "#e2e8f0",
  onItemClick,
}: PillNavProps) {
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector(".pill-label");
        const white = pill.querySelector(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.3, ease, overwrite: "auto" }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 0.3, ease, overwrite: "auto" }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 20), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 0.3, ease, overwrite: "auto" }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();
    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [items, ease]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.25,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const cssVars = {
    "--base": baseColor,
    "--pill-bg": pillColor,
    "--hover-text": hoveredPillTextColor,
    "--pill-text": pillTextColor,
  } as React.CSSProperties;

  return (
    <div className="pill-nav-container" suppressHydrationWarning>
      <nav className={`pill-nav ${className}`} aria-label="Sidebar Primary" style={cssVars}>
        <div className="pill-nav-items" suppressHydrationWarning>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => {
              const Icon = item.icon;
              const isActive = activeHref === item.href;
              return (
                <li key={item.href || `item-${i}`} role="none">
                  <Link
                    role="menuitem"
                    href={item.href}
                    onClick={() => onItemClick && onItemClick()}
                    className={`pill${isActive ? " is-active" : ""}`}
                    aria-label={item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={(el) => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">
                        {Icon && <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : item.color || "text-slate-400"}`} />}
                        <span className="text-[14px] font-bold tracking-wide">{item.label}</span>
                      </span>
                      <span className="pill-label-hover" aria-hidden="true">
                        {Icon && <Icon className="w-5 h-5 shrink-0 text-white" />}
                        <span className="text-[14px] font-bold tracking-wide">{item.label}</span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
