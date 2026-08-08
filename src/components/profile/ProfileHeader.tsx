import { Pencil } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  phone: string;
}

export default function ProfileHeader({ name, phone }: ProfileHeaderProps) {
  return (
    <section className="flex items-center gap-5 rounded-3xl border border-white/30 bg-white/20 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-8">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-primary text-3xl font-bold text-primary-foreground">
        {name.charAt(0)}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-serif text-2xl font-bold text-foreground sm:text-3xl">{name}</h1>
          <p className="text-sm text-muted-foreground">{phone}</p>
        </div>
        <button
          type="button"
          aria-label="Profilni tahrirlash"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/30 text-foreground/70 backdrop-blur-md transition-colors hover:bg-white/50 hover:text-foreground"
        >
          <Pencil size={16} />
        </button>
      </div>
    </section>
  );
}
