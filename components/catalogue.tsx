"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronDown, MessageCircle, RefreshCw, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/site-header";
import { useCart } from "@/components/cart-provider";
import RevealOnScroll from "@/components/reveal-on-scroll";
import {
  formatPrice,
  isModelMatch,
  type IphoneModel,
  type Product,
} from "@/lib/catalogue";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export default function Catalogue({
  models,
  products,
  errorMessage,
}: {
  models: IphoneModel[];
  products: Product[];
  errorMessage: string | null;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [preorderOpen, setPreorderOpen] = useState(false);
  const [preorderText, setPreorderText] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedId = window.localStorage.getItem("fwk-iphone-model");
        const validId = models.some((model) => model.id === storedId) ? storedId : null;
        setSelectedId(validId);
        if (storedId && !validId) {
          window.localStorage.removeItem("fwk-iphone-model");
        }
      } catch {
        // localStorage may fail in private mode
      }
      setReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [models]);

  const selectedModel = useMemo(
    () => models.find((model) => model.id === selectedId) ?? null,
    [models, selectedId]
  );

  const normalizedQuery = query.trim().toLowerCase();

  const matchesQuery = (product: Product) => {
    if (!normalizedQuery) return true;
    const haystack = `${product.name} ${product.category?.name ?? ""}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  };

  const cases = useMemo(
    () => products.filter((product) => product.product_type === "case"),
    [products]
  );

  const otherProducts = useMemo(
    () => products.filter((product) => product.product_type !== "case"),
    [products]
  );

  const visibleCases = useMemo(() => {
    const byModel = selectedModel
      ? cases.filter((product) => isModelMatch(product.model, selectedModel.name))
      : cases;
    return byModel.filter(matchesQuery);
  }, [cases, selectedModel, normalizedQuery]);

  const visibleOtherProducts = useMemo(
    () => otherProducts.filter(matchesQuery),
    [otherProducts, normalizedQuery]
  );

  const chooseModel = (model: IphoneModel | null) => {
    if (model) {
      setSelectedId(model.id);
      try {
        window.localStorage.setItem("fwk-iphone-model", model.id);
      } catch {}
    } else {
      setSelectedId(null);
      try {
        window.localStorage.removeItem("fwk-iphone-model");
      } catch {}
    }
    setSelectorOpen(false);
  };

  function openPreorderForModel(model: IphoneModel | null) {
    if (model && !preorderText.trim()) {
      setPreorderText(`Coque pour ${model.name}, design : `);
    }
    setPreorderOpen(true);
  }

  function sendPreorder() {
    if (!whatsappNumber) return;
    const message = preorderText.trim()
      ? `Bonjour, je voudrais précommander : ${preorderText.trim()}`
      : "Bonjour, je voudrais faire une précommande.";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-[#0E1116] text-[#EDF3FF]">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:pt-14">
        <section className="max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-light)]">
            FRANCK WATAT CASE
          </p>
          <h1 className="font-heading text-5xl font-bold uppercase leading-[0.95] sm:text-7xl">
            Ton style. Ton iPhone.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
            Des coques sport et anime pensées pour accompagner chaque match, chaque partie et chaque journée.
          </p>
        </section>

        <section className="mt-6">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher un joueur, un club, un design..."
              className="min-h-12 w-full rounded-xl border border-white/15 bg-[var(--surface)] pl-11 pr-4 text-base text-white placeholder:text-white/30 focus:border-[var(--accent)] focus:outline-none"
              aria-label="Rechercher un produit"
            />
          </div>
        </section>

        <section
          className="mt-6 rounded-2xl border border-white/10 bg-[var(--surface)] p-5 sm:p-6"
          aria-labelledby="model-title"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Filtrer le catalogue
              </p>
              <h2 id="model-title" className="font-heading text-2xl font-bold uppercase text-white">
                Quel est ton iPhone ?
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectorOpen(true)}
            disabled={!models.length || Boolean(errorMessage)}
            className="mt-4 flex min-h-12 w-full items-center justify-between rounded-xl border border-white/15 bg-[var(--surface-strong)] px-4 text-left text-base font-semibold text-white transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
            aria-haspopup="dialog"
            aria-expanded={selectorOpen}
          >
            <span>{selectedModel?.name ?? "Tous les modèles"}</span>
            <ChevronDown size={20} className="text-[var(--muted)]" aria-hidden="true" />
          </button>
        </section>

        <RevealOnScroll>
          <section className="mt-12" aria-labelledby="catalogue-title">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  La sélection FWK
                </p>
                <h2 id="catalogue-title" className="font-heading text-3xl font-bold uppercase sm:text-4xl">
                  Coques iPhone
                </h2>
              </div>
              {ready && !errorMessage && (
                <span className="text-sm font-medium text-[var(--muted)]">
                  {visibleCases.length} design{visibleCases.length > 1 ? "s" : ""}
                  {selectedModel ? ` pour ${selectedModel.name}` : ""}
                </span>
              )}
            </div>

            {errorMessage ? (
              <ErrorState message={errorMessage} onRetry={() => router.refresh()} />
            ) : !ready ? (
              <LoadingState />
            ) : visibleCases.length ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                {visibleCases.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                selectedModel={selectedModel}
                onReset={() => chooseModel(null)}
                onPreorder={() => openPreorderForModel(selectedModel)}
              />
            )}
          </section>
        </RevealOnScroll>

        {!errorMessage && ready && visibleOtherProducts.length > 0 && (
          <RevealOnScroll>
            <section className="mt-16 border-t border-white/10 pt-12" aria-labelledby="other-title">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-light)]">
                    Pour compléter ton style
                  </p>
                  <h2 id="other-title" className="font-heading text-3xl font-bold uppercase sm:text-4xl">
                    Accessoires & Bracelets
                  </h2>
                </div>
                <span className="text-sm font-medium text-[var(--muted)]">
                  {visibleOtherProducts.length} produit{visibleOtherProducts.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                {visibleOtherProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          </RevealOnScroll>
        )}

        <section className="mt-16 flex flex-col items-start gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
              <MessageCircle size={18} />
            </span>
            <div>
              <h2 className="font-heading text-xl font-bold uppercase text-white">
                Tu ne trouves pas ce que tu cherches ?
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Un joueur, un club ou un design précis en tête ? Précommande-le directement sur WhatsApp.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openPreorderForModel(selectedModel)}
            className="min-h-[44px] shrink-0 rounded-xl bg-emerald-500 px-5 text-sm font-bold uppercase text-black transition hover:bg-emerald-400"
          >
            Précommander
          </button>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-[var(--muted)]">
        © {new Date().getFullYear()} FRANCK WATAT CASE — Tous droits réservés.
      </footer>

      {selectorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setSelectorOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            className="w-full rounded-t-2xl border-t border-white/15 bg-[var(--surface)] p-5 pb-8 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:border sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 id="sheet-title" className="font-heading text-2xl font-bold uppercase text-white">
                Choisis ton iPhone
              </h2>
              <button
                type="button"
                onClick={() => setSelectorOpen(false)}
                className="flex size-10 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => chooseModel(null)}
              className="mt-4 flex min-h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-[var(--surface-strong)] px-4 text-left font-semibold text-white transition hover:border-[var(--accent)]"
            >
              <span>Tous les modèles (afficher tout)</span>
              {!selectedModel && <span className="text-xs text-[var(--accent-light)] font-bold">✓ Actif</span>}
            </button>

            <div className="mt-3 grid max-h-[55vh] gap-2 overflow-y-auto pr-1">
              {models.map((model) => {
                const isSelected = selectedModel?.id === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => chooseModel(model)}
                    className={`flex min-h-12 items-center justify-between rounded-xl border px-4 text-left font-semibold transition ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent)]/15 text-white"
                        : "border-white/10 bg-transparent text-white/90 hover:bg-white/5"
                    }`}
                  >
                    <span>{model.name}</span>
                    {isSelected && (
                      <span className="text-xs font-bold text-[var(--accent-light)]">✓ Sélectionné</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {preorderOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setPreorderOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full rounded-t-2xl border-t border-white/15 bg-[var(--surface)] p-5 pb-8 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:border sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="font-heading text-2xl font-bold uppercase text-white">
                Décris ta précommande
              </h2>
              <button
                type="button"
                onClick={() => setPreorderOpen(false)}
                className="flex size-10 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>
            <textarea
              value={preorderText}
              onChange={(e) => setPreorderText(e.target.value)}
              placeholder="Ex. coque iPhone 16 Pro Max, design PSG, ou bracelet Lakers..."
              rows={4}
              className="mt-4 w-full rounded-xl border border-white/15 bg-[var(--surface-strong)] p-3 text-sm text-white placeholder:text-white/30 focus:border-[var(--accent)] focus:outline-none"
            />
            <button
              type="button"
              onClick={sendPreorder}
              disabled={!whatsappNumber}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold uppercase text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MessageCircle size={18} />
              Envoyer sur WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const isCase = product.product_type === "case";
  const isBracelet = product.category?.slug === "bracelets";
  const priceKnown = product.price !== null;
  const showQuickAdd = !isBracelet && priceKnown;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!priceKnown) return;

    addItem({
      productId: product.id,
      name: product.name,
      modelName: isCase && product.model ? `iPhone ${product.model}` : null,
      customization: null,
      price: product.price,
      status: "in_stock",
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 500);
  }

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)] transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:shadow-xl active:scale-[0.98] active:border-white/30"
    >
      <div className="relative aspect-square w-full bg-[var(--surface-strong)]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--muted)]">
            <ShoppingBag size={40} strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}

        {showQuickAdd && (
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label="Ajouter au panier"
            className={`absolute bottom-2 right-2 z-10 flex size-10 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg transition-transform active:scale-90 ${
              justAdded ? "scale-110" : "scale-100"
            }`}
          >
            <ShoppingBag size={18} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--accent-light)]">
          {product.category?.name ?? (isCase ? "Coque iPhone" : "Accessoire")}
        </p>
        <h3 className="mt-1 font-heading text-base font-bold uppercase leading-tight text-white sm:mt-2 sm:text-2xl">
          {product.name}
        </h3>
        {isCase && product.model && (
          <p className="mt-1 text-xs font-semibold text-white/60">iPhone {product.model}</p>
        )}
        {product.description && (
          <p className="mt-2 hidden line-clamp-2 text-sm leading-6 text-[var(--muted)] sm:block">
            {product.description}
          </p>
        )}
        <div className="mt-auto pt-3 sm:pt-4">
          <p className="font-heading text-lg font-bold text-white sm:text-2xl">
            {priceKnown ? formatPrice(product.price) : "Prix à confirmer"}
          </p>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({
  selectedModel,
  onReset,
  onPreorder,
}: {
  selectedModel: IphoneModel | null;
  onReset: () => void;
  onPreorder: () => void;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-[var(--surface)] p-8 text-center sm:p-12">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent-light)]">
        <ShoppingBag size={28} aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-heading text-2xl font-bold uppercase text-white">
        Aucun design disponible pour ce modèle
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
        {selectedModel
          ? `Aucune coque n'est encore enregistrée pour ${selectedModel.name}. Précommande le design qui t'intéresse, ou vois tous les modèles disponibles.`
          : "Les designs seront affichés ici dès leur disponibilité."}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {selectedModel && (
          <button
            type="button"
            onClick={onPreorder}
            className="inline-flex min-h-[48px] items-center rounded-xl bg-emerald-500 px-5 text-sm font-bold uppercase text-black transition hover:bg-emerald-400"
          >
            Précommander ce modèle
          </button>
        )}
        {selectedModel && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-[48px] items-center rounded-xl bg-[var(--surface-strong)] px-5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3" aria-label="Chargement du catalogue">
      {[0, 1, 2].map((key) => (
        <div key={key} className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface)]">
          <div className="skeleton-shimmer aspect-square" />
          <div className="space-y-3 p-3 sm:p-5">
            <div className="skeleton-shimmer h-3 w-1/4 rounded" />
            <div className="skeleton-shimmer h-5 w-3/4 rounded" />
            <div className="skeleton-shimmer hidden h-4 w-full rounded sm:block" />
            <div className="skeleton-shimmer mt-4 h-5 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="mt-6 rounded-2xl border border-red-500/30 bg-[var(--surface)] p-6 text-center">
      <AlertTriangle className="mx-auto text-red-400" size={32} aria-hidden="true" />
      <h3 className="mt-3 font-heading text-2xl font-bold uppercase text-white">
        Chargement impossible
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mx-auto mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--surface-strong)] px-5 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        <RefreshCw size={16} />
        Réessayer
      </button>
    </div>
  );
}