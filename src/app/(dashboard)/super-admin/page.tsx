import { ClipboardList, Scissors, TrendingUp, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import AccessDenied from "@/components/dashboard/AccessDenied";
import BarberManagement from "@/components/dashboard/BarberManagement";
import StatCard from "@/components/dashboard/StatCard";
import { formatNumber } from "@/lib/format";
import { fetchAdminBarbers, fetchAdminStats, fetchAdminUsers } from "@/lib/server/backend";
import { getBackendCookie, requireSuperAdmin } from "@/lib/server/session";
import { listApplications, listUsers } from "@/lib/server/store";

export const metadata: Metadata = {
  title: "Boshqaruv paneli",
};

export const dynamic = "force-dynamic";

/** Renders whatever numeric totals `/super-admin/stats/` returns, whatever they're called. */
function statEntries(stats: Record<string, unknown> | null): [string, number][] {
  if (!stats) return [];
  return Object.entries(stats)
    .filter((entry): entry is [string, number] => typeof entry[1] === "number")
    .slice(0, 8);
}

function humanize(key: string): string {
  return key.replace(/[_-]/g, " ").replace(/^./, (char) => char.toUpperCase());
}

export default async function SuperAdminPage() {
  if (!(await requireSuperAdmin())) return <AccessDenied />;

  const cookie = await getBackendCookie();
  const [remoteUsers, remoteBarbers, stats, localUsers, applications] = await Promise.all([
    fetchAdminUsers(cookie),
    fetchAdminBarbers(cookie),
    fetchAdminStats(cookie),
    listUsers(),
    listApplications(),
  ]);

  // The backend is the source of truth; the local store only fills in while it is
  // unreachable (or for rows created during an outage).
  const users = remoteUsers.ok && remoteUsers.data ? remoteUsers.data : [];
  const userCount = Math.max(users.length, localUsers.length);
  const activeBarbers = (remoteBarbers.data ?? []).filter((barber) => barber.status === "active").length;
  const pendingApplications = applications.filter((item) => item.status === "pending").length;
  const backendStats = statEntries(stats.data);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Boshqaruv paneli</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platformaning umumiy holati bir qarashda.</p>
      </div>

      {!remoteUsers.ok && (
        <p className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground/80">
          Backend ma&apos;lumotlarini o&apos;qib bo&apos;lmadi ({remoteUsers.error ?? "noma'lum xato"}) — lokal
          nusxa ko&apos;rsatilmoqda.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard icon={Users} label="Ro'yxatdan o'tganlar" value={formatNumber(userCount)} />
        <StatCard icon={Scissors} label="Faol ustalar" value={formatNumber(activeBarbers)} />
        <StatCard icon={ClipboardList} label="Kutilayotgan arizalar" value={formatNumber(pendingApplications)} />
      </div>

      {backendStats.length > 0 && (
        <section className="flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/30 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <TrendingUp size={18} className="text-primary" />
            Backend statistikasi
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {backendStats.map(([key, value]) => (
              <div key={key}>
                <p className="text-xl font-extrabold text-foreground">{formatNumber(value)}</p>
                <p className="text-xs text-muted-foreground">{humanize(key)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

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

        {(users.length > 0 ? users : localUsers).length === 0 ? (
          <p className="text-sm text-muted-foreground">Hozircha hech kim Google orqali kirmagan.</p>
        ) : (
          <div className="flex flex-col divide-y divide-white/30">
            {(users.length > 0 ? users : localUsers).slice(0, 6).map((user) => (
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
