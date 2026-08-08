import DailySchedule from "@/components/dashboard/DailySchedule";
import { TODAY_SCHEDULE } from "@/lib/schedule";

export default function AdminPage() {
  return <DailySchedule initialEntries={TODAY_SCHEDULE} />;
}
