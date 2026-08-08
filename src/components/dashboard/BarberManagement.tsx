"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import AddBarberModal from "@/components/dashboard/AddBarberModal";
import BarberRow from "@/components/dashboard/BarberRow";
import { AVATAR_PALETTE, type ManagedBarber } from "@/lib/adminBarbers";

interface BarberManagementProps {
  initialBarbers: ManagedBarber[];
}

export default function BarberManagement({ initialBarbers }: BarberManagementProps) {
  const [barbers, setBarbers] = useState<ManagedBarber[]>(initialBarbers);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleBlock = (id: string) => {
    setBarbers((prev) =>
      prev.map((barber) =>
        barber.id === id ? { ...barber, status: barber.status === "active" ? "blocked" : "active" } : barber
      )
    );
  };

  const handleEdit = () => {
    // Editing flow is out of scope for this step — action is scaffolded for a future pass.
  };

  const handleAddBarber = (input: { name: string; specialty: string }) => {
    const newBarber: ManagedBarber = {
      id: `new-${Date.now()}`,
      name: input.name,
      specialty: input.specialty,
      avatarColor: AVATAR_PALETTE[barbers.length % AVATAR_PALETTE.length],
      status: "active",
    };
    setBarbers((prev) => [newBarber, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-bold text-foreground sm:text-2xl">Ustalar ro&apos;yxati</h2>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus size={16} />
          Yangi usta qo&apos;shish
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {barbers.map((barber) => (
          <BarberRow key={barber.id} barber={barber} onEdit={handleEdit} onToggleBlock={handleToggleBlock} />
        ))}
      </div>

      {isModalOpen && (
        <AddBarberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddBarber} />
      )}
    </section>
  );
}
