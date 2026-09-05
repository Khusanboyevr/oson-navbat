"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import BarberCard from "@/components/home/BarberCard";
import CategoryFilters, { CATEGORIES, type CategoryOption } from "@/components/home/CategoryFilters";
import MapView from "@/components/home/MapView";
import ViewToggle, { type ExplorerView } from "@/components/home/ViewToggle";
import type { BarberCategoryKey, BarberProfile } from "@/lib/types";

interface BarberExplorerProps {
  barbers: BarberProfile[];
  searchQuery: string;
}

const CATEGORY_MAP: Record<CategoryOption, BarberCategoryKey | null> = {
  Barchasi: null,
  Erkaklar: "erkaklar",
  Ayollar: "ayollar",
  Bolalar: "bolalar",
};

export default function BarberExplorer({ barbers, searchQuery }: BarberExplorerProps) {
  const [view, setView] = useState<ExplorerView>("list");
  const [category, setCategory] = useState<CategoryOption>(CATEGORIES[0]);

  const filteredBarbers = useMemo(() => {
    const categoryKey = CATEGORY_MAP[category];
    const query = searchQuery.trim().toLowerCase();

    return barbers.filter((barber) => {
      const matchesCategory = !categoryKey || barber.category === categoryKey;
      const matchesQuery =
        !query || barber.name.toLowerCase().includes(query) || barber.specialty.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [barbers, category, searchQuery]);

  return (
    <section id="top-ustalar" className="flex scroll-mt-24 flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilters selected={category} onChange={setCategory} />
        <ViewToggle view={view} onChange={setView} />
      </div>

      <h2 className="font-serif text-xl font-bold text-foreground sm:text-2xl">Top ustalar</h2>

      {filteredBarbers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/30 bg-white/20 p-10 text-center backdrop-blur-xl">
          <p className="text-sm font-semibold text-foreground">
            {searchQuery.trim() ? "Hech qanday usta topilmadi." : "Hozircha usta yo'q."}
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Tasdiqlangan ustalar shu yerda va xaritada paydo bo&apos;ladi.
          </p>
          <Link
            href="/register/barber"
            className="btn-premium rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95"
          >
            Usta bo&apos;lib qo&apos;shilish
          </Link>
        </div>
      ) : view === "list" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBarbers.map((barber) => (
            <BarberCard key={barber.id} barber={barber} />
          ))}
        </div>
      ) : (
        <MapView barbers={filteredBarbers} />
      )}
    </section>
  );
}
