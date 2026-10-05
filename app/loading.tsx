export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E1116]">
      <div className="size-10 animate-spin rounded-full border-2 border-white/15 border-t-[var(--accent)]" />
    </div>
  );
}