import { CircleDollarSign, ClipboardList, Scissors, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import AccessDenied from "@/components/dashboard/AccessDenied";
import BarberManagement from "@/components/dashboard/BarberManagement";
import StatCard from "@/components/dashboard/StatCard";
import { BOOKINGS } from "@/lib/bookings";
import { formatNumber } from "@/lib/format";
import { getManagedBarbers } from "@/lib/server/barbers-service";
import { requireSuperAdmin } from "@/lib/server/session";
import { listApplications, listUsers } from "@/lib/server/store";

export const metadata: Metadata = {
  title: "Boshqaruv paneli",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  if (!(await requireSuperAdmin())) return <AccessDenied />;

  const [users, barbers, applications] = await Promise.all([
    listUsers(),
    getManagedBarbers(),
    listApplications(),
  ]);

  const activeBarbers = barbers.filter((barber) => barber.status === "active").length;
  const pendingApplications = applications.filter((item) => item.status === "pending").length;
  const revenue = BOOKINGS.filter((booking) => booking.status === "completed").reduce(
    (total, booking) => total + booking.price,
    0
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Boshqaruv paneli</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platformaning umumiy holati bir qarashda.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Ro'yxatdan o'tganlar" value={formatNumber(users.length)} />
        <StatCard icon={Scissors} label="Faol ustalar" value={formatNumber(activeBarbers)} />
        <StatCard icon={ClipboardList} label="Kutilayotgan arizalar" value={formatNumber(pendingApplications)} />
        <StatCard
          icon={CircleDollarSign}
          label="Yakunlangan bronlar aylanmasi"
          value={`${formatNumber(revenue)} so'm`}
        />
      </div>

      {pendingApplications > 0 && (
        <Link
          href="/super-admin/applications"
          className="flex items-center justify-between gap-4 rounded-3xl border border-accent/30 bg-accent/10 p-5 transition-all duration-200 hover:-translate-y-[1px] hover:bg-accent/15"
        >
          <span className="text-sm font-semibold text-foreground">
            {pendingApplications} ta usta arizasi ko&apos;rib chiqilishini kutmoqda
          </span>
          <span className="shrink-0 text-sm font-semibold text-primary">Ko&apos;rish →</span>
        </Link>
      )}

      <BarberManagement />

      <div className="flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/30 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-6">
        <h2 className="text-lg font-bold text-foreground">So&apos;nggi ro&apos;yxatdan o&apos;tganlar</h2>

        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Hozircha hech kim Google orqali kirmagan.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-white/30">
            {users.slice(0, 6).map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  {user.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Google avatar URL
                    <img src={user.picture} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("uz-UZ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
