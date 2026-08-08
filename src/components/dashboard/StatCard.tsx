import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
}

export default function StatCard({ icon: Icon, label, value, delta }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/30 bg-white/30 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Icon size={20} />
        </span>
        {delta && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{delta}</span>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
