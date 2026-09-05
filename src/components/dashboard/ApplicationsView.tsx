"use client";

import {
  Briefcase,
  Check,
  ChevronDown,
  Clock,
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";
import type { ApplicationStatus, BarberApplication } from "@/lib/types";

const STATUS_STYLE: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: "Kutilmoqda", className: "border-accent/30 bg-accent/10 text-accent" },
  approved: { label: "Tasdiqlangan", className: "border-primary/30 bg-primary/10 text-primary" },
  rejected: { label: "Rad etilgan", className: "border-danger/30 bg-danger/10 text-danger" },
};

const CATEGORY_LABEL: Record<BarberApplication["category"], string> = {
  erkaklar: "Erkaklar",
  ayollar: "Ayollar",
  bolalar: "Bolalar",
};

/**
 * The super admin's review queue: every worker application with all of its
 * submitted data. Approving one builds the public profile and drops the marker on
 * the map; deleting removes it entirely.
 */
export default function ApplicationsView() {
  const [applications, setApplications] = useState<BarberApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Per-application backend failures, so one bad sync doesn't hide the others. */
  const [syncErrors, setSyncErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/applications", { cache: "no-store" });
      const payload = (await response.json()) as { data?: BarberApplication[]; message?: string };
      if (!response.ok) {
        setError(payload.message ?? "Arizalarni yuklab bo'lmadi");
        return;
      }
      setApplications(payload.data ?? []);
      setError(null);
    } catch {
      setError("Tarmoq xatosi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Loading from the server on mount — setState lands after the request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const review = async (id: string, status: "approved" | "rejected") => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
        data?: { backendSynced?: boolean; backendError?: string | null };
      };

      if (!response.ok) {
        setError(payload.message ?? "Amalni bajarib bo'lmadi");
        return;
      }

      setSyncErrors((prev) => {
        const next = { ...prev };
        if (status === "approved" && payload.data?.backendSynced === false) {
          next[id] = payload.data.backendError ?? "Backend sababini aytmadi";
        } else {
          delete next[id];
        }
        return next;
      });

      await load();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/applications/${id}`, { method: "DELETE" });
      if (!response.ok) {
        setError("Arizani o'chirib bo'lmadi");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = applications.filter((item) => item.status === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Ustalar arizalari</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pendingCount > 0
            ? `${pendingCount} ta ariza ko'rib chiqishni kutmoqda.`
            : "Yangi ariza yo'q."}
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/20 p-8 text-sm text-muted-foreground backdrop-blur-xl">
          <Loader2 size={16} className="animate-spin" />
          Yuklanmoqda...
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-white/30 bg-white/20 p-8 text-center text-sm text-muted-foreground backdrop-blur-xl">
          Hozircha ariza yo&apos;q. Ustalar <span className="font-mono text-xs">/register/barber</span> sahifasi
          orqali ro&apos;yxatdan o&apos;tadi.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((application) => {
            const isExpanded = expandedId === application.id;
            const isBusy = busyId === application.id;
            const status = STATUS_STYLE[application.status];
            const fullName = `${application.firstName} ${application.lastName}`;

            return (
              <div
                key={application.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {application.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- data URL from the applicant
                      <img src={application.photo} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-base font-semibold text-primary-foreground">
                        {application.firstName.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {application.profession} • {application.workplace}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : application.id)}
                      aria-label="Batafsil"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-white/30 text-foreground/70 transition-all duration-200 hover:bg-white/50 active:scale-90"
                    >
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="grid grid-cols-1 gap-2 border-t border-white/30 pt-3 text-xs text-foreground/80 sm:grid-cols-2">
                    <Detail icon={Phone} label="Telefon" value={application.phone} />
                    <Detail icon={Mail} label="Email" value={application.email} />
                    <Detail icon={Home} label="Yashash joyi" value={application.residence} />
                    <Detail icon={Briefcase} label="Ish joyi" value={application.workplace} />
                    <Detail icon={MapPin} label="Manzil" value={application.address} />
                    <Detail
                      icon={MapPin}
                      label="Lokatsiya"
                      value={`${application.coordinates.lat.toFixed(5)}, ${application.coordinates.lng.toFixed(5)}`}
                    />
                    <Detail
                      icon={Clock}
                      label="Tajriba"
                      value={`${application.experienceYears} yil • ${CATEGORY_LABEL[application.category]}`}
                    />
                    <Detail
                      icon={Clock}
                      label="Yuborilgan"
                      value={new Date(application.createdAt).toLocaleString("uz-UZ")}
                    />

                    {application.bio && (
                      <p className="sm:col-span-2">
                        <span className="font-medium text-foreground">Bio:</span> {application.bio}
                      </p>
                    )}

                    {application.services.length > 0 && (
                      <div className="sm:col-span-2">
                        <span className="font-medium text-foreground">Xizmatlar:</span>
                        <ul className="mt-1 flex flex-wrap gap-2">
                          {application.services.map((service, index) => (
                            <li
                              key={index}
                              className="rounded-full border border-white/50 bg-white/40 px-3 py-1"
                            >
                              {service.name} — {formatNumber(service.price)} so&apos;m ·{" "}
                              {service.durationMinutes} daq
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!application.syncedWithBackend && (
                      <p className="sm:col-span-2 text-[11px] text-muted-foreground">
                        Backendga hali yozilmagan.
                      </p>
                    )}
                  </div>
                )}

                {application.status === "approved" && !application.syncedWithBackend && (
                  <div className="flex flex-col gap-1 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                    <span className="font-semibold">
                      Bu usta backendga yozilmadi — mijozlarga ko&apos;rinmaydi.
                    </span>
                    {syncErrors[application.id] && <span>{syncErrors[application.id]}</span>}
                    <span className="text-foreground/70">
                      {syncErrors[application.id]?.includes("Tizimga kirilmagan")
                        ? "Backend sessiyangiz tugagan — chiqib, qaytadan Google orqali kiring va \"Qayta yuborish\" ni bosing."
                        : "Sababni tuzatib, \"Qayta yuborish\" ni bosing."}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 border-t border-white/30 pt-3">
                  {(application.status !== "approved" || !application.syncedWithBackend) && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => review(application.id, "approved")}
                      className="btn-premium flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95 disabled:opacity-50"
                    >
                      {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      {application.status === "approved" ? "Qayta yuborish" : "Tasdiqlash"}
                    </button>
                  )}

                  {application.status !== "rejected" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => review(application.id, "rejected")}
                      className="btn-premium flex items-center gap-1.5 rounded-full border border-white/50 bg-white/30 px-4 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:-translate-y-[1px] hover:bg-white/50 active:scale-95 disabled:opacity-50"
                    >
                      <X size={13} />
                      Rad etish
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => remove(application.id)}
                    className="btn-premium ml-auto flex items-center gap-1.5 rounded-full bg-danger/10 px-4 py-2 text-xs font-semibold text-danger transition-all duration-200 hover:bg-danger/20 active:scale-95 disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                    O&apos;chirish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <p className="flex items-start gap-1.5">
      <Icon size={13} className="mt-0.5 shrink-0 text-primary" />
      <span>
        <span className="font-medium text-foreground">{label}:</span> {value}
      </span>
    </p>
  );
}
