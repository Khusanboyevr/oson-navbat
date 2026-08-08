import HomeContent from "@/components/home/HomeContent";
import { BARBERS } from "@/lib/barbers";

export default function HomePage() {
  return <HomeContent barbers={BARBERS} />;
}
