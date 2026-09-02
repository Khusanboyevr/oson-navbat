import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BarberHeader from "@/components/barber/BarberHeader";
import BookingFlow from "@/components/barber/BookingFlow";
import { getPublicBarberById } from "@/lib/server/barbers-service";

interface BarberDetailPageProps {
  params: Promise<{ id: string }>;
}

// Profiles are created by approval at runtime, so this page is always fresh.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BarberDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const barber = await getPublicBarberById(id);

  if (!barber) {
    return { title: "Usta topilmadi" };
  }

  return {
    title: barber.name,
    description: `${barber.name} — ${barber.specialty}. ${barber.location}. Bir necha soniyada joy band qiling.`,
  };
}

export default async function BarberDetailPage({ params }: BarberDetailPageProps) {
  const { id } = await params;
  const barber = await getPublicBarberById(id);

  if (!barber) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8 py-8 sm:py-12">
      <Link
        href="/"
        className="flex w-fit items-center gap-2 text-sm font-medium text-foreground/70 transition-colors duration-200 hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Orqaga
      </Link>

      <BarberHeader barber={barber} />

      <BookingFlow barber={barber} />
    </div>
  );
}
