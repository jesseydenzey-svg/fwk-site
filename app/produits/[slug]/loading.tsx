import SiteHeader from "@/components/site-header";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-[#0E1116] text-[#EDF3FF]">
      <SiteHeader />

      <main className="mx-auto max-w-6xl animate-pulse px-4 pb-36 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <div className="mb-6 h-6 w-36 rounded bg-white/10" />

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Skeleton image */}
          <div className="aspect-square w-full rounded-3xl border border-white/10 bg-[var(--surface-strong)]" />

          {/* Skeleton info */}
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="h-10 w-3/4 rounded bg-white/10 sm:h-14" />
            <div className="h-8 w-1/3 rounded bg-white/10" />
            <div className="h-20 w-full rounded bg-white/5" />
            <div className="h-24 w-full rounded-2xl bg-white/10" />
            <div className="hidden h-12 w-full rounded-xl bg-white/10 sm:block" />
          </div>
        </div>
      </main>
    </div>
  );
}
