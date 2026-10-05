import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import SiteHeader from "@/components/site-header";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-[#0E1116] text-[#EDF3FF]">
      <SiteHeader />

      <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <div className="flex size-20 items-center justify-center rounded-3xl border border-white/10 bg-[var(--surface)] text-[var(--accent-light)] shadow-xl">
          <ShoppingBag size={36} aria-hidden="true" />
        </div>

        <h1 className="mt-6 font-heading text-4xl font-bold uppercase text-white sm:text-5xl">
          Produit introuvable
        </h1>

        <p className="mt-3 text-base leading-7 text-[var(--muted)]">
          Ce produit n&apos;existe pas ou n&apos;est plus disponible dans le catalogue FRANCK WATAT CASE.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#1E6BFF] px-6 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#1E6BFF]/90"
          >
            <ArrowLeft size={18} />
            <span>Retourner au catalogue</span>
          </Link>
          <a
            href="https://wa.me/237690000000?text=Bonjour%20FWK,%20je%20recherche%20un%20produit%20qui%20n'est%20pas%20sur%20le%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-[var(--surface)] px-6 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Contacter sur WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
