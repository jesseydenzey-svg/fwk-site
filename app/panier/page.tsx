"use client";

import Link from "next/link";
import { ArrowLeft, Minus, MessageCircle, Plus, ShoppingBag, Trash2 } from "lucide-react";
import SiteHeader from "@/components/site-header";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/catalogue";
import { getWhatsAppNumber } from "@/lib/whatsapp";

export default function CartPage() {
  const { items, ready, removeItem, updateQuantity } = useCart();

  const total = items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);

  const whatsappNumber = getWhatsAppNumber();
  const orderSummary = items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.name} x${item.quantity}${item.modelName ? ` (${item.modelName})` : ""}${
          item.customization ? ` [Personnalisation : ${item.customization}]` : ""
        } - ${formatPrice((item.price ?? 0) * item.quantity)}`
    )
    .join("\n");

  const whatsappText = `Bonjour FRANCK WATAT CASE, je souhaite passer commande pour mon panier :\n\n${orderSummary}\n\nTotal estimé : ${formatPrice(
    total
  )}\n\nMerci de me confirmer la disponibilité et le mode de livraison !`;

  const whatsappCheckoutUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappText
  )}`;

  return (
    <div className="min-h-screen bg-[#0E1116] text-[#EDF3FF]">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 pb-36 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center gap-2 text-sm font-semibold text-[var(--muted)] transition-colors hover:text-[var(--accent-light)]"
          >
            <ArrowLeft size={18} />
            <span>Continuer mes achats</span>
          </Link>
        </div>

        <h1 className="font-heading text-4xl font-bold uppercase text-white sm:text-5xl">
          Mon Panier
        </h1>

        {!ready ? (
          <div className="mt-8 animate-pulse space-y-4">
            <div className="h-20 w-full rounded-2xl bg-white/10" />
            <div className="h-20 w-full rounded-2xl bg-white/10" />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-white/20 bg-[var(--surface)] p-10 text-center sm:p-16">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent-light)]">
              <ShoppingBag size={32} />
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold uppercase text-white">
              Ton panier est vide
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
              Choisis une coque ou un accessoire dans le catalogue pour commencer ta sélection.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#1E6BFF] px-6 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#1E6BFF]/90"
            >
              Découvrir les designs
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-[var(--surface)] p-5"
                >
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-bold uppercase text-white">
                      {item.name}
                    </h3>
                    {item.modelName && (
                      <p className="mt-1 text-xs font-semibold text-[var(--accent-light)]">
                        Modèle : {item.modelName}
                      </p>
                    )}
                    {item.customization && (
                      <p className="mt-1.5 rounded-lg border border-white/10 bg-black/30 p-2 text-xs text-[var(--muted)]">
                        <span className="font-bold text-white">Personnalisation :</span>{" "}
                        {item.customization}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-[var(--surface-strong)] p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Diminuer la quantité"
                          className="flex size-9 items-center justify-center rounded-lg text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Augmenter la quantité"
                          className="flex size-9 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <p className="font-heading text-lg font-bold text-white">
                        {formatPrice((item.price ?? 0) * item.quantity)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex size-11 items-center justify-center rounded-xl text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                    aria-label={`Supprimer ${item.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-6">
                <h2 className="font-heading text-xl font-bold uppercase text-white">
                  Récapitulatif
                </h2>

                <div className="mt-4 space-y-2 border-b border-white/10 pb-4 text-sm">
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Nombre d&apos;articles</span>
                    <span className="font-bold text-white">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Livraison</span>
                    <span className="text-xs font-semibold uppercase text-emerald-400">
                      Calculée sur WhatsApp
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-base font-bold text-white">Total</span>
                  <span className="font-heading text-2xl font-bold text-white">
                    {formatPrice(total)}
                  </span>
                </div>

                <a
                  href={whatsappCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-bold uppercase tracking-wider text-black shadow-lg transition hover:bg-[#25D366]/90 active:scale-98"
                >
                  <MessageCircle size={18} />
                  <span>Commander via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {ready && items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0E1116]/95 p-4 backdrop-blur-md sm:hidden">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Total</p>
              <p className="font-heading text-xl font-bold text-white">{formatPrice(total)}</p>
            </div>
            <a
              href={whatsappCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-bold uppercase tracking-wider text-black shadow-lg"
            >
              <MessageCircle size={18} />
              <span>Commander</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}