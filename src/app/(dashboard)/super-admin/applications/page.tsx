import type { Metadata } from "next";
import AccessDenied from "@/components/dashboard/AccessDenied";
import ApplicationsView from "@/components/dashboard/ApplicationsView";
import { requireSuperAdmin } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Ustalar arizalari",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminApplicationsPage() {
  if (!(await requireSuperAdmin())) return <AccessDenied />;
  return <ApplicationsView />;
}
