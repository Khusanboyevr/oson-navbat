"use client";

import { Ban, CheckCircle2, Loader2, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import type { AppUser, UserRole } from "@/lib/types";

const ROLE_LABEL: Record<UserRole, string> = {
  client: "Mijoz",
  barber: "Usta",
  superadmin: "Super admin",
};

/**
 * Everyone who registered with Google — this is where "ro'yxatdan o'tganlar super
 * adminga keladi" lands. Name and email come straight from the Google account.
 */
export default function UsersView() {
  const { user: currentUser } = useSession();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const payload = (await response.json()) as { data?: AppUser[]; message?: string };
      if (!response.ok) {
        setError(payload.message ?? "Foydalanuvchilarni yuklab bo'lmadi");
        return;
      }
      setUsers(payload.data ?? []);
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

  const mutate = async (id: string, init: RequestInit) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/users/${id}`, init);
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        setError(payload.message ?? "Amalni bajarib bo'lmadi");
        return;
      }
      setError(null);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(normalized) || user.email.toLowerCase().includes(normalized)
    );
  }, [users, query]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Foydalanuvchilar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Google orqali ro&apos;yxatdan o&apos;tgan barcha hisoblar ({users.length} ta).
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      <div className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/20 px-4 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <Search size={18} className="shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="text"
          placeholder="Ism yoki email bo'yicha qidiring..."
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/20 p-8 text-sm text-muted-foreground backdrop-blur-xl">
          <Loader2 size={16} className="animate-spin" />
          Yuklanmoqda...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/30 bg-white/20 p-8 text-center text-sm text-muted-foreground backdrop-blur-xl">
          Hech narsa topilmadi.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((user) => {
            const isActive = user.status === "active";
            const isBusy = busyId === user.id;
            // The server refuses these on your own account; don't offer them either.
            const isSelf = currentUser?.id === user.id;

            return (
              <div
                key={user.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 hover:bg-white/25 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {user.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Google avatar URL
                    <img src={user.picture} alt="" className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("uz-UZ")} da qo&apos;shildi
                      {user.syncedWithBackend ? " • backendda bor" : " • faqat lokal"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                  <span className="rounded-full border border-white/50 bg-white/40 px-3 py-1 text-xs font-medium text-foreground/70">
                    {ROLE_LABEL[user.role]}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      isActive
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-accent/30 bg-accent/10 text-accent"
                    }`}
                  >
                    {isActive ? "Faol" : "Bloklangan"}
                  </span>

                  <button
                    type="button"
                    disabled={isBusy || isSelf}
                    title={isSelf ? "O'z hisobingiz" : undefined}
                    onClick={() =>
                      mutate(user.id, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: isActive ? "blocked" : "active" }),
                      })
                    }
                    className={`btn-premium flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-[1px] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                      isActive
                        ? "bg-accent text-accent-foreground hover:bg-accent-hover"
                        : "bg-primary text-primary-foreground hover:bg-primary-hover"
                    }`}
                  >
                    {isBusy ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : isActive ? (
                      <Ban size={12} />
                    ) : (
                      <CheckCircle2 size={12} />
                    )}
                    {isActive ? "Bloklash" : "Faollashtirish"}
                  </button>

                  <button
                    type="button"
                    disabled={isBusy || isSelf}
                    title={isSelf ? "O'z hisobingiz" : undefined}
                    onClick={() => mutate(user.id, { method: "DELETE" })}
                    aria-label="Foydalanuvchini o'chirish"
                    className="btn-premium flex h-8 w-8 items-center justify-center rounded-full bg-danger/10 text-danger transition-all duration-200 hover:bg-danger/20 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={13} />
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
