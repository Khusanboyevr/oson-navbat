import { ShieldAlert } from "lucide-react";
import Link from "next/link";

/** Shown when someone opens a super-admin page without the role. */
export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/30 bg-white/30 p-8 text-center shadow-[0_4px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
        <ShieldAlert size={30} />
      </span>
      <div>
        <h1 className="font-serif text-xl font-bold text-foreground">Ruxsat yo&apos;q</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Bu bo&apos;limga faqat super admin kira oladi. Super admin hisobingiz bilan Google orqali kiring.
        </p>
      </div>
      <Link
        href="/login"
        className="btn-premium rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95"
      >
        Kirish
      </Link>
    </div>
  );
}
