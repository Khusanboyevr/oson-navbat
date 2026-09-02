"use client";

import type { SessionUser } from "@/lib/types";

const ROLE_LABEL: Record<SessionUser["role"], string> = {
  client: "Mijoz",
  barber: "Usta",
  superadmin: "Super admin",
};

/** Name, email and photo come from the Google account — nothing to type in. */
export default function ProfileHeader({ user }: { user: SessionUser }) {
  return (
    <section className="flex items-center gap-5 rounded-3xl border border-white/30 bg-white/20 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-8">
      {user.picture ? (
        // eslint-disable-next-line @next/next/no-img-element -- Google avatar URL
        <img src={user.picture} alt="" className="h-20 w-20 shrink-0 rounded-3xl object-cover" />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-primary text-3xl font-bold text-primary-foreground">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-serif text-2xl font-bold text-foreground sm:text-3xl">{user.name}</h1>
        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        <span className="mt-2 inline-block rounded-full border border-white/50 bg-white/40 px-3 py-1 text-xs font-medium text-foreground/70">
          {ROLE_LABEL[user.role]}
        </span>
      </div>
    </section>
  );
}
