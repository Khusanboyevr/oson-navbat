import type { ReactNode } from "react";
import AppShell from "@/components/layout/AppShell";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AppShell>{children}</AppShell>
    </LanguageProvider>
  );
}
