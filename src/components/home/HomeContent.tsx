"use client";

import { useCallback, useEffect, useState } from "react";
import BarberExplorer from "@/components/home/BarberExplorer";
import Hero from "@/components/home/Hero";
import type { BarberProfile } from "@/lib/types";

interface HomeContentProps {
  initialBarbers: BarberProfile[];
}

/** How often the open tab re-checks for newly approved workers. */
const REFRESH_INTERVAL_MS = 60_000;

export default function HomeContent({ initialBarbers }: HomeContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [barbers, setBarbers] = useState(initialBarbers);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/barbers", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { data?: BarberProfile[] };
      if (payload.data) setBarbers(payload.data);
    } catch {
      // Offline or a hiccup — keep showing what's already on screen.
    }
  }, []);

  // Keeps the list and the map current as the super admin approves new ustas,
  // both on a timer and whenever the user comes back to the tab.
  useEffect(() => {
    const timer = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    const handleFocus = () => void refresh();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refresh]);

  return (
    <div className="flex flex-col gap-10 py-8 sm:py-12">
      <Hero query={searchQuery} onQueryChange={setSearchQuery} />
      <BarberExplorer barbers={barbers} searchQuery={searchQuery} />
    </div>
  );
}
