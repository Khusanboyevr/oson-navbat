export default function DashboardBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute -left-40 -top-40 h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-[26rem] w-[26rem] rounded-full bg-accent/10 blur-3xl" />
    </div>
  );
}
