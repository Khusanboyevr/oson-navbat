"use client";

import { useMemo, useState, type ReactNode } from "react";
import BookingModal from "@/components/barber/BookingModal";
import BookingSummary from "@/components/barber/BookingSummary";
import DateTimePicker from "@/components/barber/DateTimePicker";
import ServiceList from "@/components/barber/ServiceList";
import { getTashkentTodayIso } from "@/lib/dates";
import type { BarberProfile } from "@/lib/types";

interface BookingFlowProps {
  barber: BarberProfile;
}

export default function BookingFlow({ barber }: BookingFlowProps) {
  // Only backend-owned ustas can take bookings; the prefix marks them.
  const isBookable = barber.id.startsWith("backend-");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDateIso, setSelectedDateIso] = useState<string>(getTashkentTodayIso);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedService = useMemo(
    () => barber.services.find((service) => service.id === selectedServiceId) ?? null,
    [barber.services, selectedServiceId]
  );

  const handleSelectDate = (iso: string) => {
    setSelectedDateIso(iso);
    setSelectedTime(null);
  };

  return (
    <div className="grid gap-8 pb-28 lg:grid-cols-[1fr_360px] lg:pb-0">
      <div className="flex flex-col gap-8">
        <Step index={1} title="Xizmatni tanlang" done={Boolean(selectedService)}>
          <ServiceList
            services={barber.services}
            selectedServiceId={selectedServiceId}
            onSelect={setSelectedServiceId}
          />
        </Step>

        <Step index={2} title="Sana va vaqtni tanlang" done={Boolean(selectedTime)}>
          <DateTimePicker
            barberId={barber.id}
            serviceId={selectedServiceId}
            selectedDateIso={selectedDateIso}
            selectedTime={selectedTime}
            onSelectDate={handleSelectDate}
            onSelectTime={setSelectedTime}
          />
        </Step>
      </div>

      {!isBookable && (
        <p className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground/80 lg:col-span-2">
          Bu usta hali tasdiqlanmagan, shuning uchun bron qilish vaqtincha yopiq.
        </p>
      )}

      <BookingSummary
        barber={barber}
        canBook={isBookable}
        service={selectedService}
        dateIso={selectedDateIso}
        time={selectedTime}
        onContinue={() => setIsModalOpen(true)}
      />

      {isModalOpen && selectedService && selectedTime && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          barber={barber}
          service={selectedService}
          dateIso={selectedDateIso}
          time={selectedTime}
        />
      )}
    </div>
  );
}

/** A numbered step, ticked once its choice has been made. */
function Step({
  index,
  title,
  done,
  children,
}: {
  index: number;
  title: string;
  done: boolean;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${
            done ? "bg-primary text-primary-foreground" : "bg-white/60 text-foreground/60"
          }`}
        >
          {index}
        </span>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}
