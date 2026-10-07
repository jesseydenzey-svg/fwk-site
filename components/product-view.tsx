"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import SiteHeader from "@/components/site-header";
import { useCart } from "@/components/cart-provider";
import {
  formatPrice,
  isBracelet,
  type IphoneModel,
  type Product,
} from "@/lib/catalogue";
import { getWhatsAppNumber } from "@/lib/whatsapp";

export default function ProductView({
  product,
}: {
  product: Product;
  models: IphoneModel[];
}) {
  const { addItem } = useCart();
  const [customization, setCustomization] = useState("");
  const [whatsappDesc, setWhatsappDesc] = useState("");
  const [added, setAdded] = useState(false);

  const isCaseType = product.product_type === "case";
  const isBraceletType = isBracelet(product);
  const priceKnown = product.price !== null;

  const handleAddToCart = () => {
    if (!priceKnown) return;

    addItem({
      productId: product.id,
      name: product.name,
      modelName: isCaseType ? (product.model ? `iPhone ${product.model}` : null) : null,
      customization: isBraceletType && customization.trim() ? customization.trim() : null,
      price: product.price,
      status: "in_stock",
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const whatsappNumber = getWhatsAppNumber();
  const baseMessage = `Bonjour FRANCK WATAT CASE, je suis sur la page du produit "${product.name}".`;
  const extraMessage = whatsappDesc.trim()
    ? `\n\nVoici ma demande de précommande / personnalisation :\n${whatsappDesc.trim()}`
    : `\n\nJe souhaite précommander ou demander plus d'informations sur ce produit.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    baseMessage + extraMessage
  )}`;

  const displayPrice = priceKnown ? formatPrice(product.price) : "Prix à confirmer";

  return (
    <div className="min-h-screen bg-[#0E1116] text-[#EDF3FF]">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-36 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center gap-2 text-sm font-semibold text-[var(--muted)] transition-colors hover:text-[var(--accent-light)]"
          >
            <ArrowLeft size={18} />
            <span>Retour au catalogue</span>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/10 bg-[var(--surface)] shadow-2xl">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-[var(--muted)]">
                <ShoppingBag size={64} strokeWidth={1.2} aria-hidden="true" />
                <span className="mt-4 text-sm uppercase tracking-wider">Visuel bientôt disponible</span>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-light)]">
              {product.category?.name ?? (isCaseType ? "Coque iPhone" : isBraceletType ? "Bracelet" : "Accessoire")}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold uppercase leading-tight text-white sm:text-5xl">
              {product.name}
            </h1>

            {isCaseType && product.model && (
              <p className="mt-2 text-sm font-semibold text-white/70">
                Compatible iPhone {product.model}
              </p>
            )}

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-heading text-3xl font-bold text-white sm:text-4xl">
                {displayPrice}
              </span>
              {priceKnown && (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  En stock
                </span>
              )}
            </div>

            {product.description && (
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-base leading-7 text-[var(--muted)]">
                  {product.description}
                </p>
              </div>
            )}

            {isBraceletType && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-[var(--surface)] p-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[var(--accent-light)]" />
                  <label htmlFor="bracelet-custom" className="text-sm font-bold uppercase tracking-wider text-white">
                    Personnalisation libre du bracelet
                  </label>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Indique le texte, nom, numéro ou motif à graver / imprimer sur ton bracelet.
                </p>
                <textarea
                  id="bracelet-custom"
                  value={customization}
                  onChange={(e) => setCustomization(e.target.value)}
                  rows={3}
                  placeholder="Ex : Mamba Forever #24, Initiales FW, Numéro 10..."
                  className="mt-3 w-full rounded-xl border border-white/15 bg-[var(--surface-strong)] p-3.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-[var(--accent)]"
                />
              </div>
            )}

            {!isCaseType && !isBraceletType && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-[var(--surface)] p-5">
                <p className="text-sm font-semibold text-white">Produit officiel FRANCK WATAT CASE</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  Accessoire haut de gamme conçu pour durer et compléter ton équipement au quotidien.
                </p>
              </div>
            )}

            {!priceKnown && (
              <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
                Le prix de ce produit n&apos;est pas encore fixé. Utilise la précommande WhatsApp ci-dessous pour en savoir plus.
              </div>
            )}

            {added && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 text-sm font-semibold text-emerald-300">
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-emerald-400" />
                  <span>Produit ajouté au panier !</span>
                </div>
                <Link href="/panier" className="text-xs uppercase underline tracking-wider hover:text-white">
                  Voir le panier
                </Link>
              </div>
            )}

            <div className="mt-6 hidden sm:block">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!priceKnown}
                className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl bg-[#1E6BFF] px-6 text-base font-bold uppercase tracking-wider text-white shadow-lg transition-transform duration-150 hover:bg-[#1E6BFF]/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag size={20} />
                <span>{priceKnown ? "Ajouter au panier" : "Prix à confirmer"}</span>
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6">
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[var(--surface)]/50 p-3">
                <Truck size={20} className="shrink-0 text-[var(--accent-light)]" />
               <span className="text-xs text-[var(--muted)]">Livraison express partout au Cameroun, au frais du client</span> 
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[var(--surface)]/50 p-3">
                <ShieldCheck size={20} className="shrink-0 text-[var(--accent-light)]" />
                <span className="text-xs text-[var(--muted)]">Qualité FWK garantie</span>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-14 rounded-3xl border border-white/10 bg-[var(--surface)] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <MessageCircle size={14} />
                <span>Service sur-mesure</span>
              </div>
              <h2 className="mt-3 font-heading text-2xl font-bold uppercase text-white sm:text-3xl">
                Tu ne trouves pas ce que tu cherches ? Précommande sur WhatsApp
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Un joueur en particulier ? Un club, un personnage d&apos;anime ou ton propre design pour ton iPhone ?
                Écris ta demande ci-dessous et contacte-nous directement sur WhatsApp.
              </p>

              <div className="mt-4 space-y-2">
                <label
                  htmlFor="whatsapp-desc"
                  className="block text-xs font-bold uppercase tracking-wider text-white/80"
                >
                  Description libre de ton projet :
                </label>
                <textarea
                  id="whatsapp-desc"
                  value={whatsappDesc}
                  onChange={(e) => setWhatsappDesc(e.target.value)}
                  rows={2}
                  placeholder="Ex : Je veux ce design adapté pour iPhone 14 Pro avec mon prénom 'Arthur' au dos..."
                  className="w-full rounded-xl border border-white/15 bg-[var(--surface-strong)] p-3 text-sm text-white placeholder-white/35 outline-none transition focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="shrink-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] px-6 text-sm font-bold uppercase tracking-wider text-black shadow-lg transition hover:bg-[#25D366]/90 active:scale-98 sm:w-auto"
              >
                <MessageCircle size={20} />
                <span>Précommander sur WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0E1116]/95 p-4 backdrop-blur-md sm:hidden">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Total</p>
            <p className="font-heading text-xl font-bold text-white">{displayPrice}</p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!priceKnown}
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#1E6BFF] px-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag size={18} />
            <span>{!priceKnown ? "Prix à confirmer" : added ? "Ajouté !" : "Ajouter au panier"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}