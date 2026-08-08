"use client";

import { CalendarClock, History } from "lucide-react";
import { useState } from "react";
import BookingCard from "@/components/bookings/BookingCard";
import BookingTabs, { type BookingTab } from "@/components/bookings/BookingTabs";
import ScreenPlaceholder from "@/components/layout/ScreenPlaceholder";
import { getBarberById } from "@/lib/barbers";
import type { Booking } from "@/lib/bookings";

interface BookingsViewProps {
  bookings: Booking[];
}

export default function BookingsView({ bookings: initialBookings }: BookingsViewProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [tab, setTab] = useState<BookingTab>("faol");

  const handleCancel = (id: string) => {
    setBookings((prev) =>
      prev.map((booking) => (booking.id === id ? { ...booking, status: "cancelled" } : booking))
    );
  };

  const filtered = bookings.filter((booking) =>
    tab === "faol" ? booking.status === "pending" || booking.status === "confirmed" : booking.status !== "pending" && booking.status !== "confirmed"
  );

  return (
    <div className="flex flex-col gap-6 py-8 sm:py-12">
      <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Mening bronlarim</h1>

      <BookingTabs tab={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        tab === "faol" ? (
          <ScreenPlaceholder
            icon={CalendarClock}
            title="Faol bronlar yo'q"
            description="Yangi bron qilganingizda shu yerda ko'rinadi."
          />
        ) : (
          <ScreenPlaceholder
            icon={History}
            title="Tarix bo'sh"
            description="Yakunlangan tashriflaringiz shu yerda saqlanadi."
          />
        )
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((booking) => {
            const barber = getBarberById(booking.barberId);
            if (!barber) return null;
            return <BookingCard key={booking.id} booking={booking} barber={barber} onCancel={handleCancel} />;
          })}
        </div>
      )}
    </div>
  );
}
