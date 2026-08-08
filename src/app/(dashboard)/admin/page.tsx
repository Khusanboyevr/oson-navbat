import type { Metadata } from "next";
import DailySchedule from "@/components/dashboard/DailySchedule";
import { TODAY_SCHEDULE } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "Usta paneli",
};

export default function AdminPage() {
  return <DailySchedule initialEntries={TODAY_SCHEDULE} />;
}
