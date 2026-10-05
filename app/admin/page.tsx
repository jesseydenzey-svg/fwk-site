"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ExternalLink,
  LogOut,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminGuard } from "@/lib/admin-guard";

type Product = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  category_id: string | null;
  model: string | null;
  price: number | null;
  is_active: boolean;
};

export default function AdminPage() {
  const router = useRouter();
  const ready = useAdminGuard();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from("products")
        .select("id, name, slug, image_url, category_id, model, price, is_active")
        .order("name");

      if (fetchErr) throw fetchErr;
      setProducts(data ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`Impossible de charger les produits (${message}).`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) {
      const timer = setTimeout(() => {
        fetchProducts();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [ready]);

  async function handleDelete(product: Product) {
    if (!supabase) return;
    if (!confirm(`Supprimer définitivement "${product.name}" et sa photo ?`)) return;

    setDeletingId(product.id);
    setDeleteError(null);

    try {
      // 1. Supprimer l'image du bucket Storage "produits" si présente
      if (product.image_url) {
        const parts = product.image_url.split("/produits/");
        if (parts[1]) {
          const filePath = decodeURIComponent(parts[1].split("?")[0]);
          const { error: storageErr } = await supabase.storage
            .from("produits")
            .remove([filePath]);
          if (storageErr) {
            console.warn("Avertissement suppression image storage:", storageErr);
          }
        }
      }

      // 2. Supprimer la ligne en base de données
      const { error: dbErr } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (dbErr) throw dbErr;

      // 3. Mettre à jour l'état local
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur de suppression";
      setDeleteError(`Échec de la suppression de "${product.name}" : ${message}`);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#141822] p-6 text-white">
          <RefreshCw className="animate-spin text-[var(--accent)]" size={24} />
          <span>Vérification de la session admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barre supérieure Admin */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-light)]">
            Panneau d&apos;administration
          </span>
          <h1 className="font-heading text-3xl font-bold uppercase text-white sm:text-4xl">
            Gestion du Catalogue
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <ExternalLink size={16} />
            <span>Voir le site</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* En-tête de section avec bouton d'ajout */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold uppercase text-white">
            Produits enregistrés ({products.length})
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Ajoute, modifie ou supprime les coques et accessoires du catalogue.
          </p>
        </div>

        <Link
          href="/admin/produits/nouveau"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#1E6BFF] px-5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#1E6BFF]/90"
        >
          <Plus size={18} />
          <span>Ajouter un produit</span>
        </Link>
      </div>

      {/* Message d'erreur de suppression */}
      {deleteError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-950/60 p-4 text-sm text-red-300"
        >
          <AlertTriangle size={20} className="shrink-0 text-red-400" />
          <p className="flex-1">{deleteError}</p>
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="text-xs uppercase underline hover:text-white"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Message d'erreur de chargement initial */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-950/50 p-4 text-sm text-red-300"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchProducts}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-white/10 px-4 text-xs font-bold uppercase text-white hover:bg-white/20"
          >
            <RefreshCw size={14} />
            <span>Réessayer</span>
          </button>
        </div>
      )}

      {/* État de chargement */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-4 rounded-xl border border-white/10 bg-[#141822] p-4"
            >
              <div className="size-14 rounded-lg bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-white/10" />
                <div className="h-3 w-1/4 rounded bg-white/5" />
              </div>
              <div className="h-10 w-24 rounded-lg bg-white/10" />
            </div>
          ))}
        </div>
      )}

      {/* État vide */}
      {!loading && !error && products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/20 bg-[#141822] p-12 text-center">
          <ShoppingBag size={40} className="mx-auto text-[var(--muted)]" />
          <h3 className="mt-4 font-heading text-xl font-bold uppercase text-white">
            Aucun produit dans le catalogue
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Commence par ajouter une première coque ou un accessoire.
          </p>
          <Link
            href="/admin/produits/nouveau"
            className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#1E6BFF] px-5 text-sm font-bold uppercase tracking-wider text-white"
          >
            <Plus size={18} />
            <span>Ajouter le premier produit</span>
          </Link>
        </div>
      )}

      {/* Liste des produits */}
      {!loading && products.length > 0 && (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#141822] p-4 transition hover:border-white/20"
            >
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-white/5">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      loading="lazy"
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--muted)]">
                      <ShoppingBag size={22} />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{product.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {product.model ? `iPhone ${product.model}` : "Modèle universel"} ·{" "}
                    <span className="font-semibold text-white">
                      {product.price ? `${new Intl.NumberFormat("fr-FR").format(product.price)} FCFA` : "Prix non défini"}
                    </span>
                    {!product.is_active && (
                      <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                        Inactif
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/produits/${product.id}`}
                  className="inline-flex min-h-[48px] items-center rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Modifier
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  disabled={deletingId === product.id}
                  className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-950/40 px-3.5 text-sm font-semibold text-red-400 transition hover:bg-red-900/50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Supprimer ${product.name}`}
                >
                  <Trash2 size={16} />
                  <span>{deletingId === product.id ? "Suppression..." : "Supprimer"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}