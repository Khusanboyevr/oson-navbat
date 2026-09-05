import type { Metadata } from "next";
import AccessDenied from "@/components/dashboard/AccessDenied";
import DailySchedule from "@/components/dashboard/DailySchedule";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Usta paneli",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role === "client") return <AccessDenied role="usta" />;

  return <DailySchedule />;
}
