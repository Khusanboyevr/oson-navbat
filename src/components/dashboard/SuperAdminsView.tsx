"use client";

import { Loader2, Mail, Plus, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";

interface SuperAdminEntry {
  email: string;
  name: string | null;
  picture: string | null;
  state: "active" | "invited";
  id: string | null;
}

/**
 * Managing who else can run the platform.
 *
 * Adding someone who has already signed in changes their role on the backend
 * immediately. Adding an email that has never signed in records the promise, and
 * the role is granted the first time they do — the backend has no account to
 * promote until then.
 */
export default function SuperAdminsView() {
  const { user } = useSession();
  const [admins, setAdmins] = useState<SuperAdminEntry[]>([]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/super-admins", { cache: "no-store" });
      const payload = (await response.json()) as { data?: SuperAdminEntry[]; message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Ro'yxatni yuklab bo'lmadi");
        return;
      }
      setAdmins(payload.data ?? []);
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

  const handleAdd = async () => {
    if (isAdding || !email.trim()) return;
    setIsAdding(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/super-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Qo'shib bo'lmadi");
        return;
      }

      setNotice(payload.message ?? "Super admin qo'shildi.");
      setEmail("");
      await load();
    } catch {
      setError("Tarmoq xatosi");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (target: string) => {
    setBusyEmail(target);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/super-admins?email=${encodeURIComponent(target)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        setError(payload.message ?? "O'chirib bo'lmadi");
        return;
      }
      await load();
    } finally {
      setBusyEmail(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Super adminlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platformani boshqara oladigan hisoblar. Email qo&apos;shsangiz, o&apos;sha odam Google orqali
          kirganda super admin bo&apos;ladi.
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}
      {notice && (
        <p className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground/80">
          {notice}
        </p>
      )}

      <section className="flex flex-col gap-3 rounded-3xl border border-white/30 bg-white/30 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-6">
        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <UserPlus size={16} className="text-primary" />
          Yangi super admin qo&apos;shish
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/50 bg-white/60 px-4 py-2.5">
            <Mail size={15} className="shrink-0 text-muted-foreground" />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleAdd();
              }}
              type="email"
              inputMode="email"
              placeholder="admin@gmail.com"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isAdding || !email.trim()}
            className="btn-premium flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isAdding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Qo&apos;shish
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Google hisobi emaili bo&apos;lishi kerak — odam o&apos;sha email bilan kiradi.
        </p>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/20 p-8 text-sm text-muted-foreground backdrop-blur-xl">
          <Loader2 size={16} className="animate-spin" />
          Yuklanmoqda...
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {admins.map((entry) => {
            const isSelf = user?.email.toLowerCase() === entry.email.toLowerCase();
            const isBusy = busyEmail === entry.email;

            return (
              <div
                key={entry.email}
                className="flex flex-col gap-3 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {entry.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Google avatar URL
                    <img src={entry.picture} alt="" className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <ShieldCheck size={20} />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {entry.name ?? entry.email}
                      {isSelf && <span className="ml-2 text-xs text-muted-foreground">(siz)</span>}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{entry.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      entry.state === "active"
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-accent/30 bg-accent/10 text-accent"
                    }`}
                  >
                    {entry.state === "active" ? "Faol" : "Kirishi kutilmoqda"}
                  </span>

                  <button
                    type="button"
                    disabled={isBusy || isSelf}
                    title={isSelf ? "O'zingizni chiqarib bo'lmaydi" : undefined}
                    onClick={() => handleRemove(entry.email)}
                    aria-label="Super adminlikdan chiqarish"
                    className="btn-premium flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-danger transition-all duration-200 hover:bg-danger/20 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={15} />}
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
