"use client";

import { List, Map as MapIcon, type LucideIcon } from "lucide-react";

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
  return (
    <div className="inline-flex items-center gap-1 self-start rounded-full border border-white/30 bg-white/20 p-1 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const isActive = value === view;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out active:scale-95 ${
              isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-white/30"
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
