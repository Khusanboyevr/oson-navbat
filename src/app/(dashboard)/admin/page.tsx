import type { Metadata } from "next";
import DailySchedule from "@/components/dashboard/DailySchedule";

export const metadata: Metadata = {
  title: "Usta paneli",
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <DailySchedule />;
}
