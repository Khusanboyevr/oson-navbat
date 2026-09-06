import type { ReactNode } from "react";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import MeshBackground from "@/components/layout/MeshBackground";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <MeshBackground />
      <Header />
      {/* The padding clears the phone tab bar; on a desktop there isn't one. */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-24 sm:px-6 md:pb-0 lg:px-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
