import type { Metadata } from "next";
import CustomersView from "@/components/dashboard/CustomersView";
import { CUSTOMERS } from "@/lib/adminCustomers";

export const metadata: Metadata = {
  title: "Mijozlar",
};

export default function SuperAdminUsersPage() {
  return <CustomersView customers={CUSTOMERS} />;
}
