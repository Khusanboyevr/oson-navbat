import type { LucideIcon } from "lucide-react";

interface ScreenPlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function ScreenPlaceholder({ icon: Icon, title, description }: ScreenPlaceholderProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/40 bg-white/50 text-primary backdrop-blur-xl">
        <Icon size={28} />
      </div>
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
