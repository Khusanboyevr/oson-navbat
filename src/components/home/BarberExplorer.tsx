"use client";

import { useMemo, useState } from "react";
import BarberCard from "@/components/home/BarberCard";
import CategoryFilters, { CATEGORIES, type CategoryOption } from "@/components/home/CategoryFilters";
import MapView from "@/components/home/MapView";
import ViewToggle, { type ExplorerView } from "@/components/home/ViewToggle";
import type { Barber, BarberCategory } from "@/lib/barbers";

interface BarberExplorerProps {
  barbers: Barber[];
  searchQuery: string;
}

const CATEGORY_MAP: Record<CategoryOption, BarberCategory | null> = {
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
        <div className="rounded-3xl border border-white/30 bg-white/20 p-8 text-center text-sm text-muted-foreground backdrop-blur-xl">
          Hech qanday usta topilmadi.
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
