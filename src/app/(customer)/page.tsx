import Hero from "@/components/home/Hero";
import BarberExplorer from "@/components/home/BarberExplorer";
import { BARBERS } from "@/lib/barbers";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10 py-8 sm:py-12">
      <Hero />
      <BarberExplorer barbers={BARBERS} />
    </div>
  );
}
