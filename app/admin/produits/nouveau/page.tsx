"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ImagePlus,
  RefreshCw,
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

export default function NewProductPage() {
  const router = useRouter();
  const ready = useAdminGuard();

  // Reference data
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<IphoneModel[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [productType, setProductType] = useState<"case" | "bracelet" | "other">("case");
  const [categoryId, setCategoryId] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Status & error states
  const [submitting, setSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !supabase) return;

    Promise.all([
      supabase.from("categories").select("id, name, slug").order("name"),
      supabase.from("iphone_models").select("id, name, sort_order").order("sort_order"),
    ])
      .then(([catRes, modRes]) => {
        if (catRes.data) setCategories(catRes.data);
        if (modRes.data) {
          setModels(modRes.data);
          if (modRes.data.length > 0) {
            // default model
            const norm = modRes.data[0].name.replace(/^iphone\s*/i, "").trim();
            setModel(norm);
          }
        }
      })
      .catch((err) => {
        console.warn("Erreur chargement données de référence:", err);
      })
      .finally(() => {
        setLoadingInit(false);
      });
  }, [ready]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(val));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setError(null);
  const selected = e.target.files?.[0];
  if (!selected) return;

  if (!selected.type.startsWith("image/")) {
    setError("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).");
    return;
  }

  const maxSizeBytes = 5 * 1024 * 1024;
  if (selected.size > maxSizeBytes) {
    setError("La photo dépasse 5 Mo. Compresse-la ou choisis une image plus légère.");
    return;
  }

  setFile(selected);
  const objectUrl = URL.createObjectURL(selected);
  setPreviewUrl(objectUrl);
};

  const handleRemovePhoto = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
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

    let imageUrl: string | null = null;

    try {
      // 1. Upload direct vers le bucket Storage "produits" si une image est sélectionnée
      if (file) {
        setLoadingStep("Téléversement de la photo vers le bucket 'produits'...");
        const ext = file.name.split(".").pop() || "jpg";
        const cleanFileName = `${finalSlug}-${Date.now()}.${ext.toLowerCase()}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("produits")
          .upload(cleanFileName, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadErr) {
          throw new Error(`Upload échoué (${uploadErr.message})`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("produits").getPublicUrl(uploadData.path);

        imageUrl = publicUrl;
      }

      // 2. Sauvegarde dans la table public.products
      setLoadingStep("Enregistrement du produit dans la base de données...");

      const parsedPrice = price.trim() ? parseInt(price.trim(), 10) : null;
      if (price.trim() && (isNaN(parsedPrice!) || parsedPrice! < 0)) {
        throw new Error("Le prix doit être un nombre entier positif.");
      }

      const { error: insertErr } = await supabase.from("products").insert({
        name: name.trim(),
        slug: finalSlug,
        description: description.trim(),
        image_url: imageUrl,
        category_id: categoryId ? categoryId : null,
        product_type: productType,
        model: productType === "case" && model.trim() ? model.trim() : null,
        price: parsedPrice,
        is_active: isActive,
      });

      if (insertErr) {
        throw new Error(`Sauvegarde échouée (${insertErr.message})`);
      }

      // 3. Succès -> redirection vers l'admin
      router.push("/admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(msg);
      setSubmitting(false);
      setLoadingStep(null);
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Retour & Titre */}
      <div>
        <Link
          href="/admin"
          className="inline-flex min-h-[48px] items-center gap-2 text-sm font-semibold text-[var(--muted)] transition-colors hover:text-white"
        >
          <ArrowLeft size={18} />
          <span>Retour à la liste</span>
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-bold uppercase text-white sm:text-4xl">
          Ajouter un produit
        </h1>
        <p className="text-xs text-[var(--muted)]">
          Remplis les détails du produit et téléverse sa photo dans le catalogue.
        </p>
      </div>

      {/* Erreur globale */}
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
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ex : Kobe Bryant - Black Mamba"
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
            placeholder="Ex : kobe-bryant-black-mamba"
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

        {/* Modèle iPhone (uniquement pour les coques) */}
        {productType === "case" && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-white">
              Modèle d&apos;iPhone associé *
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
                placeholder="Ou saisir (ex : 16 Pro Max)"
                className="w-full rounded-xl border border-white/10 bg-[#0E1116] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--accent)]"
              />
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              Indique le format abrégé en base (ex : 12, 13 Pro, 15 Pro Max, 16).
            </p>
          </div>
        )}

        {/* Prix en FCFA */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-white">
            Prix en FCFA (optionnel si à confirmer)
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex : 4000"
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
            placeholder="Description du produit, matériaux, finitions..."
            className="w-full rounded-xl border border-white/10 bg-[#0E1116] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        {/* Upload de photo direct vers Storage "produits" */}
        <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-white">
            Photo du produit (Bucket &quot;produits&quot;)
          </label>

          {previewUrl ? (
            <div className="relative inline-block overflow-hidden rounded-xl border border-white/15 bg-black/40">
              <div className="relative size-36">
                <Image
                  src={previewUrl}
                  alt="Aperçu photo"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-red-600/90 text-white shadow-md hover:bg-red-700"
                aria-label="Supprimer la photo"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 p-6 text-center">
              <ImagePlus size={32} className="text-[var(--muted)]" />
              <p className="mt-2 text-xs font-semibold text-white">
                Sélectionne une photo à téléverser
              </p>
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Fichiers JPG, PNG ou WebP
              </p>
              <label className="mt-3 inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-white/10 px-4 text-xs font-bold uppercase text-white transition hover:bg-white/20">
                <Upload size={16} />
                <span>Choisir une photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Visibilité */}
        <div className="flex items-center gap-3 pt-2">
          <input
            id="is_active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-5 rounded border-white/20 bg-[#0E1116] text-[var(--accent)] focus:ring-0"
          />
          <label htmlFor="is_active" className="cursor-pointer text-sm font-semibold text-white">
            Rendre ce produit visible immédiatement dans le catalogue
          </label>
        </div>

        {/* Bouton de soumission */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting || loadingInit}
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
                <span>Enregistrer le produit</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
