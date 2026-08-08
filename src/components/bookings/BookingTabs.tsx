"use client";

export type BookingTab = "faol" | "tarix";

interface BookingTabsProps {
  tab: BookingTab;
  onChange: (tab: BookingTab) => void;
}

const TABS: { value: BookingTab; label: string }[] = [
  { value: "faol", label: "Faol" },
  { value: "tarix", label: "Tarix" },
];

export default function BookingTabs({ tab, onChange }: BookingTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 self-start rounded-full border border-white/30 bg-white/20 p-1 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl">
      {TABS.map(({ value, label }) => {
        const isActive = value === tab;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 ease-in-out active:scale-95 ${
              isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-white/30"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
