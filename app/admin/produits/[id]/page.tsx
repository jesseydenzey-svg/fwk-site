"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminGuard } from "@/lib/admin-guard";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type IphoneModel = {
  id: string;
  name: string;
  sort_order: number;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const router = useRouter();
  const ready = useAdminGuard();

  // Reference data
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<IphoneModel[]>([]);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [productType, setProductType] = useState<"case" | "bracelet" | "other">("case");
  const [categoryId, setCategoryId] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Photos: existing image & new file replacement
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);

  // States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!ready || !supabase) return;

    Promise.all([
      supabase.from("categories").select("id, name, slug").order("name"),
      supabase.from("iphone_models").select("id, name, sort_order").order("sort_order"),
      supabase.from("products").select("*").eq("id", productId).maybeSingle(),
    ])
      .then(([catRes, modRes, prodRes]) => {
        if (catRes.data) setCategories(catRes.data);
        if (modRes.data) setModels(modRes.data);

        if (prodRes.error || !prodRes.data) {
          setError("Produit introuvable dans la base de données.");
          setLoading(false);
          return;
        }

        const p = prodRes.data;
        setName(p.name || "");
        setSlug(p.slug || "");
        setProductType((p.product_type as "case" | "bracelet" | "other") || "case");
        setCategoryId(p.category_id || "");
        setModel(p.model || "");
        setPrice(p.price !== null && p.price !== undefined ? String(p.price) : "");
        setDescription(p.description || "");
        setIsActive(p.is_active ?? true);
        setExistingImageUrl(p.image_url || null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Erreur de chargement";
        setError(`Impossible de charger les données : ${msg}`);
        setLoading(false);
      });
  }, [ready, productId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Veuillez choisir un fichier image valide (JPG, PNG, WebP).");
      return;
    }

    setNewFile(selected);
    const objUrl = URL.createObjectURL(selected);
    setNewPreviewUrl(objUrl);
  };

  const handleCancelReplacement = () => {
    setNewFile(null);
    if (newPreviewUrl) {
      URL.revokeObjectURL(newPreviewUrl);
      setNewPreviewUrl(null);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("La connexion Supabase n'est pas disponible.");
      return;
    }

    if (!name.trim()) {
      setError("Le nom du produit est requis.");
      return;
    }

    const finalSlug = (slug.trim() || slugify(name)).trim();
    if (!finalSlug) {
      setError("Le slug du produit est requis.");
      return;
    }

    setSubmitting(true);
    setError(null);

    let finalImageUrl = existingImageUrl;

    try {
      // 1. Remplacement de photo : upload vers le bucket "produits" si un nouveau fichier a été sélectionné
      if (newFile) {
        setLoadingStep("Téléversement de la nouvelle photo vers le bucket 'produits'...");
        const ext = newFile.name.split(".").pop() || "jpg";
        const cleanFileName = `${finalSlug}-${Date.now()}.${ext.toLowerCase()}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("produits")
          .upload(cleanFileName, newFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadErr) {
          throw new Error(`Upload échoué (${uploadErr.message})`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("produits").getPublicUrl(uploadData.path);

        // Supprimer l'ancienne photo du storage pour libérer de la place
        if (existingImageUrl && existingImageUrl.includes("/produits/")) {
          const oldPath = decodeURIComponent(
            existingImageUrl.split("/produits/")[1]?.split("?")[0] || ""
          );
          if (oldPath && oldPath !== cleanFileName) {
            await supabase.storage.from("produits").remove([oldPath]);
          }
        }

        finalImageUrl = publicUrl;
      }

      // 2. Mise à jour de la table products
      setLoadingStep("Mise à jour du produit dans la base de données...");

      const parsedPrice = price.trim() ? parseInt(price.trim(), 10) : null;
      if (price.trim() && (isNaN(parsedPrice!) || parsedPrice! < 0)) {
        throw new Error("Le prix doit être un nombre entier positif.");
      }

      const { error: updateErr } = await supabase
        .from("products")
        .update({
          name: name.trim(),
          slug: finalSlug,
          description: description.trim(),
          image_url: finalImageUrl,
          category_id: categoryId || null,
          product_type: productType,
          model: productType === "case" && model.trim() ? model.trim() : null,
          price: parsedPrice,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (updateErr) {
        throw new Error(`Sauvegarde échouée (${updateErr.message})`);
      }

      // 3. Redirection vers /admin
      router.push("/admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(msg);
      setSubmitting(false);
      setLoadingStep(null);
    }
  }

  async function handleDeleteProduct() {
    if (!supabase) return;
    if (!confirm(`Supprimer définitivement "${name}" et sa photo ?`)) return;

    setDeleting(true);
    setError(null);

    try {
      if (existingImageUrl) {
        const parts = existingImageUrl.split("/produits/");
        if (parts[1]) {
          const filePath = decodeURIComponent(parts[1].split("?")[0]);
          await supabase.storage.from("produits").remove([filePath]);
        }
      }

      const { error: delErr } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (delErr) throw delErr;

      router.push("/admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de suppression";
      setError(`Échec de la suppression : ${msg}`);
      setDeleting(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-white">
        <RefreshCw className="animate-spin text-[var(--accent)]" size={24} />
        <span className="ml-3">Vérification de la session...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-64 animate-pulse rounded bg-white/10" />
        <div className="h-96 w-full animate-pulse rounded-2xl bg-[#141822]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Retour & Titre */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex min-h-[48px] items-center gap-2 text-sm font-semibold text-[var(--muted)] transition-colors hover:text-white"
          >
            <ArrowLeft size={18} />
            <span>Retour à la liste</span>
          </Link>
          <h1 className="mt-1 font-heading text-3xl font-bold uppercase text-white sm:text-4xl">
            Modifier le produit
          </h1>
          <p className="text-xs text-[var(--muted)]">
            ID : <span className="font-mono text-white/70">{productId}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleDeleteProduct}
          disabled={deleting}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 px-4 text-xs font-bold uppercase tracking-wider text-red-300 transition hover:bg-red-900/50 disabled:opacity-50"
        >
          <Trash2 size={16} />
          <span>{deleting ? "Suppression..." : "Supprimer"}</span>
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-950/60 p-4 text-sm text-red-300"
        >
          <AlertTriangle size={20} className="shrink-0 text-red-400" />
          <p className="flex-1">{error}</p>
        </div>
      )}

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-white/10 bg-[#141822] p-6 shadow-xl"
      >
        {/* Nom du produit */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-white">
            Nom du produit *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0E1116] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-white">
            Identifiant URL (Slug) *
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-[#0E1116] px-4 py-3 font-mono text-sm text-white outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        {/* Type de produit */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-white">
              Type de produit *
            </label>
            <select
              value={productType}
              onChange={(e) =>
                setProductType(e.target.value as "case" | "bracelet" | "other")
              }
              className="w-full rounded-xl border border-white/10 bg-[#0E1116] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--accent)]"
            >
              <option value="case">Coque iPhone (case)</option>
              <option value="bracelet">Bracelet (personnalisable)</option>
              <option value="other">Autre produit / Accessoire</option>
            </select>
          </div>

          {/* Catégorie */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-white">
              Catégorie
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0E1116] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--accent)]"
            >
              <option value="">Aucune catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modèle iPhone (si coque) */}
        {productType === "case" && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-white">
              Modèle d&apos;iPhone associé
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0E1116] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--accent)]"
              >
                <option value="">Sélectionner un modèle...</option>
                {models.map((m) => {
                  const norm = m.name.replace(/^iphone\s*/i, "").trim();
                  return (
                    <option key={m.id} value={norm}>
                      {m.name}
                    </option>
                  );
                })}
              </select>

              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ou saisir le modèle (ex : 16 Pro Max)"
                className="w-full rounded-xl border border-white/10 bg-[#0E1116] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--accent)]"
              />
            </div>
          </div>
        )}

        {/* Prix en FCFA */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-white">
            Prix en FCFA
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex : 5000"
            className="w-full rounded-xl border border-white/10 bg-[#0E1116] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-white">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0E1116] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        {/* Gestion & Remplacement de photo (Bucket "produits") */}
        <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-white">
            Photo du produit (Bucket Storage &quot;produits&quot;)
          </label>

          <div className="flex flex-wrap items-center gap-4">
            {/* Aperçu photo actuelle */}
            {existingImageUrl && !newPreviewUrl && (
              <div className="relative inline-block overflow-hidden rounded-xl border border-white/15 bg-black/40">
                <div className="relative size-32">
                  <Image
                    src={existingImageUrl}
                    alt="Photo actuelle"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="absolute bottom-0 left-0 right-0 bg-black/75 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white/80">
                  Actuelle
                </span>
              </div>
            )}

            {/* Aperçu nouvelle photo en remplacement */}
            {newPreviewUrl && (
              <div className="relative inline-block overflow-hidden rounded-xl border border-[var(--accent)] bg-black/40">
                <div className="relative size-32">
                  <Image
                    src={newPreviewUrl}
                    alt="Nouvelle photo"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCancelReplacement}
                  className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700"
                  aria-label="Annuler le remplacement"
                >
                  <X size={14} />
                </button>
                <span className="absolute bottom-0 left-0 right-0 bg-[var(--accent)] py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white">
                  Nouvelle
                </span>
              </div>
            )}

            {/* Bouton de sélection / remplacement */}
            <div className="flex flex-col gap-2">
              <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-xs font-bold uppercase text-white transition hover:bg-white/20">
                <Upload size={16} />
                <span>
                  {existingImageUrl ? "Remplacer la photo" : "Ajouter une photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {newFile && (
                <button
                  type="button"
                  onClick={handleCancelReplacement}
                  className="text-left text-xs text-red-400 underline hover:text-red-300"
                >
                  Annuler le remplacement
                </button>
              )}

              {!existingImageUrl && !newPreviewUrl && (
                <p className="text-[11px] text-[var(--muted)]">
                  Aucune image enregistrée pour ce produit.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Visibilité */}
        <div className="flex items-center gap-3 pt-2">
          <input
            id="is_active_edit"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-5 rounded border-white/20 bg-[#0E1116] text-[var(--accent)] focus:ring-0"
          />
          <label
            htmlFor="is_active_edit"
            className="cursor-pointer text-sm font-semibold text-white"
          >
            Produit actif et visible au catalogue
          </label>
        </div>

        {/* Bouton de soumission */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#1E6BFF] px-6 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#1E6BFF]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>{loadingStep || "Enregistrement..."}</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Mettre à jour le produit</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
