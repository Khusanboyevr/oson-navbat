import type { Customer } from "@/lib/adminCustomers";

interface CustomerRowProps {
  customer: Customer;
}

export default function CustomerRow({ customer }: CustomerRowProps) {
  const isActive = customer.status === "active";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 hover:bg-white/25 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: customer.avatarColor }}
        >
          {customer.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{customer.name}</p>
          <p className="truncate text-xs text-muted-foreground">{customer.phone}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
        <span className="shrink-0 text-xs font-medium text-muted-foreground">{customer.totalBookings} ta bron</span>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
            isActive ? "border-primary/30 bg-primary/10 text-primary" : "border-accent/30 bg-accent/10 text-accent"
          }`}
        >
          {isActive ? "Faol" : "Bloklangan"}
        </span>
      </div>
    </div>
  );
}
