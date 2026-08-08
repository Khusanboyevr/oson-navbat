"use client";

import { useMemo, useState } from "react";
import BookingModal from "@/components/barber/BookingModal";
import BookingSummary from "@/components/barber/BookingSummary";
import DateTimePicker from "@/components/barber/DateTimePicker";
import ServiceList from "@/components/barber/ServiceList";
import { formatDateLabel, getTashkentTodayIso } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import type { Barber } from "@/lib/barbers";

interface BookingFlowProps {
  barber: Barber;
}

export default function BookingFlow({ barber }: BookingFlowProps) {
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
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-foreground">Xizmatni tanlang</h2>
          <ServiceList
            services={barber.services}
            selectedServiceId={selectedServiceId}
            onSelect={setSelectedServiceId}
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-foreground">Sana va vaqtni tanlang</h2>
          <DateTimePicker
            selectedDateIso={selectedDateIso}
            selectedTime={selectedTime}
            onSelectDate={handleSelectDate}
            onSelectTime={setSelectedTime}
          />
        </section>
      </div>

      <BookingSummary
        service={selectedService}
        dateIso={selectedDateIso}
        time={selectedTime}
        onContinue={() => setIsModalOpen(true)}
      />

      {isModalOpen && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          summary={{
            serviceName: selectedService?.name ?? "",
            dateLabel: formatDateLabel(selectedDateIso),
            time: selectedTime ?? "",
            priceLabel: selectedService ? `${formatNumber(selectedService.price)} so'm` : "",
          }}
        />
      )}
    </div>
  );
}
