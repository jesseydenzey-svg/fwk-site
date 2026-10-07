"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalogue";

const captionByKeyword: { match: string; caption: string }[] = [
  { match: "lamelo", caption: "Agilité" },
  { match: "kobe", caption: "Mentalité de champion" },
  { match: "curry", caption: "Précision" },
  { match: "giannis", caption: "Puissance" },
  { match: "morant", caption: "Explosivité" },
  { match: "sukuna", caption: "Domination" },
  { match: "jin-woo", caption: "Ascension" },
  { match: "fushiguro", caption: "Sang-froid" },
  { match: "tjay", caption: "Authenticité" },
];

const captionByCategory: Record<string, string> = {
  basketball: "Puissance",
  football: "Passion",
  anime: "Détermination",
  artistes: "Authenticité",
};

function captionFor(product: Product): string {
  const name = product.name.toLowerCase();
  const found = captionByKeyword.find((entry) => name.includes(entry.match));
  if (found) return found.caption;
  const slug = product.category?.slug ?? "";
  return captionByCategory[slug] ?? "Style FWK";
}

export default function HeroShowcase({ products }: { products: Product[] }) {
  const slides = useMemo(
    () =>
      products
        .filter((p) => p.image_url)
        .slice(0, 6)
        .map((p) => ({ product: p, caption: captionFor(p) })),
    [products]
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  const current = slides[index];

  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/10 bg-[var(--surface)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Image
        key={current.product.id}
        src={current.product.image_url as string}
        alt={current.product.name}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 45vw"
        className="hero-fade-image object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <div key={`${current.product.id}-caption`} className="hero-fade-caption absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="font-heading text-3xl font-bold uppercase text-white sm:text-4xl">
          {current.caption}
        </p>
        <p className="mt-1 text-sm font-semibold text-white/70">{current.product.name}</p>
      </div>

      {slides.length > 1 && (
        <div className="absolute right-4 top-4 flex gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.product.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Voir ${slide.product.name}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}