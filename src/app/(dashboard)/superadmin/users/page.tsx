import CustomersView from "@/components/dashboard/CustomersView";
import { CUSTOMERS } from "@/lib/adminCustomers";

export default function SuperAdminUsersPage() {
  return <CustomersView customers={CUSTOMERS} />;
}
