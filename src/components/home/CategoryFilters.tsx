"use client";

import { useState } from "react";

const CATEGORIES = ["Barchasi", "Erkaklar", "Ayollar", "Bolalar"];

export default function CategoryFilters() {
  const [active, setActive] = useState<string>(CATEGORIES[0]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {CATEGORIES.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-xl transition-all duration-300 ${
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-white/30 bg-white/20 text-foreground/80 hover:bg-white/30"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
