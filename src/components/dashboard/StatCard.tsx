import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
}

export default function StatCard({ icon: Icon, label, value, delta }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-white/30 bg-white/30 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:gap-3 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/15 text-primary sm:h-11 sm:w-11">
          <Icon size={20} />
        </span>
        {delta && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{delta}</span>
        )}
      </div>
      <div>
        <p className="truncate text-xl font-extrabold text-foreground sm:text-2xl">{value}</p>
        <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
      </div>
    </div>
  );
}
