import type { Metadata } from "next";
import AccessDenied from "@/components/dashboard/AccessDenied";
import SuperAdminsView from "@/components/dashboard/SuperAdminsView";
import { requireSuperAdmin } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Super adminlar",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminsPage() {
  if (!(await requireSuperAdmin())) return <AccessDenied />;
  return <SuperAdminsView />;
}
