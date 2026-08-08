export default function MeshBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute -right-24 top-1/4 h-[32rem] w-[32rem] rounded-full bg-accent/25 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-[26rem] w-[26rem] rounded-full bg-[#aec7e8]/40 blur-3xl" />
      <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-[#d9c08a]/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-3xl" />
    </div>
  );
}
