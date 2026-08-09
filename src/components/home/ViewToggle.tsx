"use client";

import { List, Map as MapIcon, type LucideIcon } from "lucide-react";
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";

export type ExplorerView = "list" | "map";

interface ViewToggleProps {
  view: ExplorerView;
  onChange: (view: ExplorerView) => void;
}

const OPTIONS: { value: ExplorerView; label: string; icon: LucideIcon }[] = [
  { value: "list", label: "Ro'yxat", icon: List },
  { value: "map", label: "Xarita", icon: MapIcon },
];

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  const { containerRef, registerItem, style: indicatorStyle } = useSlidingIndicator(view);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center gap-1 self-start rounded-full border border-white/30 bg-white/15 p-1 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl"
    >
      {indicatorStyle && (
        <span
          aria-hidden
          className="absolute inset-y-1 rounded-full border border-white/50 bg-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
      )}
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const isActive = value === view;
        return (
          <button
            key={value}
            ref={registerItem(value)}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className={`relative z-10 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 active:scale-95 ${
              isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
