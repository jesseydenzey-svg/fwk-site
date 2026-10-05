"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";

export default function FloatingCartButton() {
  const pathname = usePathname();
  const { items, ready } = useCart();
  const count = ready ? items.length : 0;
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (!ready) return;
    setBump(true);
    const timer = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(timer);
  }, [count, ready]);

  if (pathname === "/panier") return null;

  const isProductPage = pathname.startsWith("/produits/");

  return (
    <Link
      href="/panier"
      aria-label={`Panier${count > 0 ? `, ${count} article${count === 1 ? "" : "s"}` : ""}`}
      className={`fixed right-4 z-50 flex size-14 items-center justify-center rounded-full bg-[#1E6BFF] text-white shadow-[0_4px_14px_rgba(0,0,0,0.45)] transition-transform duration-200 ease-out active:scale-95 motion-reduce:transition-none ${
        bump ? "scale-110" : "scale-100"
      } ${
        isProductPage
          ? "bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(1rem+env(safe-area-inset-bottom,0px))]"
          : "bottom-[calc(1rem+env(safe-area-inset-bottom,0px))]"
      }`}
    >
      <ShoppingBag size={24} strokeWidth={2} aria-hidden="true" />
      {count > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-white px-1 py-0.5 text-[11px] font-bold leading-none text-[#1E6BFF]"
          aria-live="polite"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}