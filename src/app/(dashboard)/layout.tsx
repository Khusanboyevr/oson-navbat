import type { ReactNode } from "react";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <DashboardBackground />
      <DashboardSidebar />
      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
