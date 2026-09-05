import type { Metadata } from "next";
import AccessDenied from "@/components/dashboard/AccessDenied";
import BarberProfileEditor from "@/components/dashboard/BarberProfileEditor";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Mening profilim",
};

export const dynamic = "force-dynamic";

/** Where an usta edits what customers see: their photo, bio and service menu. */
export default async function BarberProfilePage() {
  const user = await getCurrentUser();
  if (!user || user.role === "client") return <AccessDenied role="usta" />;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Mening profilim</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bu yerdagi ma&apos;lumotlar xaritadagi kartochkangizda va bron sahifangizda ko&apos;rinadi.
        </p>
      </div>

      <BarberProfileEditor />
    </div>
  );
}
