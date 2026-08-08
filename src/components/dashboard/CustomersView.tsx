"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import CustomerRow from "@/components/dashboard/CustomerRow";
import type { Customer } from "@/lib/adminCustomers";

interface CustomersViewProps {
  customers: Customer[];
}

export default function CustomersView({ customers }: CustomersViewProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(normalized) || customer.phone.toLowerCase().includes(normalized)
    );
  }, [customers, query]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Mijozlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tizimda ro&apos;yxatdan o&apos;tgan barcha mijozlar.</p>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/20 px-4 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <Search size={18} className="shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="text"
          placeholder="Ism yoki telefon raqami bo'yicha qidiring..."
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/30 bg-white/20 p-6 text-center text-sm text-muted-foreground backdrop-blur-xl">
            Hech narsa topilmadi.
          </div>
        ) : (
          filtered.map((customer) => <CustomerRow key={customer.id} customer={customer} />)
        )}
      </div>
    </div>
  );
}
