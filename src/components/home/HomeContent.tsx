"use client";

import { useState } from "react";
import BarberExplorer from "@/components/home/BarberExplorer";
import Hero from "@/components/home/Hero";
import type { Barber } from "@/lib/barbers";

interface HomeContentProps {
  barbers: Barber[];
}

export default function HomeContent({ barbers }: HomeContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col gap-10 py-8 sm:py-12">
      <Hero query={searchQuery} onQueryChange={setSearchQuery} />
      <BarberExplorer barbers={barbers} searchQuery={searchQuery} />
    </div>
  );
}
