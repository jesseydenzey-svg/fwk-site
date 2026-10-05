"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";

export default function SiteHeader() {
  const { items, ready } = useCart();
  const count = ready ? items.length : 0;

  return (
    <header className="border-b border-white/10 bg-[#0e1116]">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="FRANCK WATAT CASE, accueil">
          <Image src="/brand/logo.png" alt="FRANCK WATAT CASE" width={150} height={48} priority className="h-9 w-auto object-contain sm:h-10" />
        </Link>

        <div className="flex items-center gap-5">
          <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)] sm:block">FWK / SHOP</span>
          <Link href="/panier" aria-label={`Panier, ${count} article${count === 1 ? "" : "s"}`} className="relative flex size-12 items-center justify-center border border-white/15 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-light)]">
            <ShoppingBag size={21} aria-hidden="true" />
            <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white" aria-live="polite">{count}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}