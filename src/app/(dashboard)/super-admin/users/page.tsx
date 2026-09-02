import type { Metadata } from "next";
import AccessDenied from "@/components/dashboard/AccessDenied";
import UsersView from "@/components/dashboard/UsersView";
import { requireSuperAdmin } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Foydalanuvchilar",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminUsersPage() {
  if (!(await requireSuperAdmin())) return <AccessDenied />;
  return <UsersView />;
}
