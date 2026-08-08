import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import BarberHeader from "@/components/barber/BarberHeader";
import BookingFlow from "@/components/barber/BookingFlow";
import { getBarberById } from "@/lib/barbers";

interface BarberDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BarberDetailPage({ params }: BarberDetailPageProps) {
  const { id } = await params;
  const barber = getBarberById(id);

  if (!barber) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8 py-8 sm:py-12">
      <Link
        href="/"
        className="flex w-fit items-center gap-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Orqaga
      </Link>

      <BarberHeader barber={barber} />

      <BookingFlow barber={barber} />
    </div>
  );
}
