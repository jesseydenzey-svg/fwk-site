"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import SiteHeader from "@/components/site-header";

export default function ProductError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0E1116] text-[#EDF3FF]">
      <SiteHeader />

      <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <div className="flex size-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-950/30 text-red-400 shadow-xl">
          <AlertTriangle size={36} aria-hidden="true" />
        </div>

        <h1 className="mt-6 font-heading text-4xl font-bold uppercase text-white sm:text-5xl">
          Erreur de chargement
        </h1>

        <p className="mt-3 text-base leading-7 text-[var(--muted)]">
          Impossible d&apos;afficher ce produit pour le moment. Vérifie ta connexion internet ou réessaie dans quelques instants.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#1E6BFF] px-6 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#1E6BFF]/90"
          >
            <RefreshCw size={18} />
            <span>Réessayer</span>
          </button>
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-[var(--surface)] px-6 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            <ArrowLeft size={18} />
            <span>Retour au catalogue</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
