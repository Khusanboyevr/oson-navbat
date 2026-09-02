import HomeContent from "@/components/home/HomeContent";
import { getPublicBarbers } from "@/lib/server/barbers-service";

// Approved workers appear the moment they're approved, so this page can't be static.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const barbers = await getPublicBarbers();
  return <HomeContent initialBarbers={barbers} />;
}
