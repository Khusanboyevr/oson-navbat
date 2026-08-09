"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import AddBarberModal from "@/components/dashboard/AddBarberModal";
import BarberRow from "@/components/dashboard/BarberRow";
import { AVATAR_PALETTE, type ManagedBarber } from "@/lib/adminBarbers";

interface BarberManagementProps {
  initialBarbers: ManagedBarber[];
}

function inferSpecialtyCategory(specialty: string): string {
  if (specialty.includes("Bolalar")) return "Bolalar";
  if (specialty.includes("Manikyur") || specialty.includes("turmagi") || specialty.includes("Kirpik")) {
    return "Ayollar";
  }
  return "Erkaklar";
}

export default function BarberManagement({ initialBarbers }: BarberManagementProps) {
  const [barbers, setBarbers] = useState<ManagedBarber[]>(initialBarbers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<ManagedBarber | null>(null);

  const handleToggleBlock = (id: string) => {
    setBarbers((prev) =>
      prev.map((barber) =>
        barber.id === id ? { ...barber, status: barber.status === "active" ? "blocked" : "active" } : barber
      )
    );
  };

  const handleOpenAdd = () => {
    setEditingBarber(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const barber = barbers.find((item) => item.id === id);
    if (!barber) return;
    setEditingBarber(barber);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBarber(null);
  };

  const handleSaveBarber = (input: { name: string; specialty: string }) => {
    if (editingBarber) {
      setBarbers((prev) =>
        prev.map((barber) =>
          barber.id === editingBarber.id ? { ...barber, name: input.name, specialty: input.specialty } : barber
        )
      );
    } else {
      const newBarber: ManagedBarber = {
        id: `new-${Date.now()}`,
        name: input.name,
        specialty: input.specialty,
        avatarColor: AVATAR_PALETTE[barbers.length % AVATAR_PALETTE.length],
        status: "active",
      };
      setBarbers((prev) => [newBarber, ...prev]);
    }
    handleCloseModal();
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-bold text-foreground sm:text-2xl">Ustalar ro&apos;yxati</h2>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-premium flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-[0_8px_24px_rgba(20,94,229,0.45)] active:scale-95"
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
        <AddBarberModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveBarber}
          initialValues={
            editingBarber
              ? { name: editingBarber.name, specialty: inferSpecialtyCategory(editingBarber.specialty) }
              : undefined
          }
        />
      )}
    </section>
  );
}
