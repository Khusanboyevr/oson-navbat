import { CircleDollarSign, Scissors, Users } from "lucide-react";
import BarberManagement from "@/components/dashboard/BarberManagement";
import StatCard from "@/components/dashboard/StatCard";
import { getBarberById } from "@/lib/barbers";
import { MANAGED_BARBERS } from "@/lib/adminBarbers";
import { SUPERADMIN_STATS } from "@/lib/adminStats";
import { BOOKINGS, type BookingStatus } from "@/lib/bookings";
import { formatNumber } from "@/lib/format";

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "⏳ Kutilmoqda",
  confirmed: "Tasdiqlangan",
  completed: "✅ Yakunlangan",
};

export default function SuperAdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Boshqaruv paneli</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platformaning umumiy holati bir qarashda.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Jami mijozlar"
          value={formatNumber(SUPERADMIN_STATS.totalUsers)}
          delta={SUPERADMIN_STATS.usersDelta}
        />
        <StatCard
          icon={Scissors}
          label="Tizimdagi ustalar"
          value={formatNumber(SUPERADMIN_STATS.systemBarbers)}
          delta={SUPERADMIN_STATS.barbersDelta}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Jami aylanma"
          value={`${formatNumber(SUPERADMIN_STATS.totalRevenue)} so'm`}
          delta={SUPERADMIN_STATS.revenueDelta}
        />
      </div>

      <BarberManagement initialBarbers={MANAGED_BARBERS} />

      <div className="flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/30 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-6">
        <h2 className="text-lg font-bold text-foreground">So&apos;nggi bronlar</h2>
        <div className="flex flex-col divide-y divide-white/30">
          {BOOKINGS.map((booking) => {
            const barber = getBarberById(booking.barberId);
            if (!barber) return null;
            return (
              <div key={booking.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: barber.avatarColor }}
                  >
                    {barber.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{barber.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {booking.serviceName} • {booking.dateLabel}, {booking.time}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {STATUS_LABEL[booking.status]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
