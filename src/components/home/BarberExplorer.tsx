"use client";

import { useState } from "react";
import BarberCard from "@/components/home/BarberCard";
import CategoryFilters from "@/components/home/CategoryFilters";
import MapView from "@/components/home/MapView";
import ViewToggle, { type ExplorerView } from "@/components/home/ViewToggle";
import type { Barber } from "@/lib/barbers";

interface BarberExplorerProps {
  barbers: Barber[];
}

export default function BarberExplorer({ barbers }: BarberExplorerProps) {
  const [view, setView] = useState<ExplorerView>("list");

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilters />
        <ViewToggle view={view} onChange={setView} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-foreground sm:text-2xl">Top ustalar</h2>
        <button type="button" className="text-sm font-medium text-primary hover:text-primary-hover">
          Barchasini ko&apos;rish
        </button>
      </div>

      {view === "list" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {barbers.map((barber) => (
            <BarberCard key={barber.id} barber={barber} />
          ))}
        </div>
      ) : (
        <MapView barbers={barbers} />
      )}
    </section>
  );
}
