import type { ReactNode } from "react";
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
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
