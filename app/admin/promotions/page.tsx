"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flame,
  PowerOff,
  RefreshCw,
  Sparkles,
  Tag,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminGuard } from "@/lib/admin-guard";
import type { Promotion } from "@/lib/catalogue";

export default function AdminPromotionsPage() {
  const ready = useAdminGuard();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [activePromo, setActivePromo] = useState<Promotion | null>(null);
  const [pastPromos, setPastPromos] = useState<Promotion[]>([]);

  // Form states
  const [label, setLabel] = useState("");
  const [discountPercent, setDiscountPercent] = useState<string>("20");

  const fetchPromotions = async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch active promo
      const { data: activeData, error: activeErr } = await supabase
        .from("promotions")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeErr) throw activeErr;
      setActivePromo((activeData as Promotion) ?? null);

      // 2. Fetch past promos (history)
      const { data: historyData, error: historyErr } = await supabase
        .from("promotions")
        .select("*")
        .eq("is_active", false)
        .order("created_at", { ascending: false })
        .limit(6);

      if (!historyErr && historyData) {
        setPastPromos(historyData as Promotion[]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`Impossible de charger les promotions (${msg}).`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) {
      fetchPromotions();
    }
  }, [ready]);

  // Handler: Deactivate current promo
  const handleDeactivate = async () => {
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error: updateErr } = await supabase
        .from("promotions")
        .update({ is_active: false })
        .eq("is_active", true);

      if (updateErr) throw updateErr;

      setSuccessMsg("La promotion a été désactivée avec succès.");
      await fetchPromotions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de désactivation";
      setError(`Échec de la désactivation : ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Activate new promo
  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      setError("Veuillez renseigner un libellé pour la promotion.");
      return;
    }

    const parsedPercent = parseInt(discountPercent.trim(), 10);
    if (isNaN(parsedPercent) || parsedPercent < 1 || parsedPercent > 90) {
      setError("Le pourcentage de réduction doit être un nombre compris entre 1 et 90.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Deactivate any currently active promotions first
      const { error: deactivateErr } = await supabase
        .from("promotions")
        .update({ is_active: false })
        .eq("is_active", true);

      if (deactivateErr) throw deactivateErr;

      // 2. Insert new active promotion
      const { error: insertErr } = await supabase.from("promotions").insert({
        label: trimmedLabel,
        discount_percent: parsedPercent,
        is_active: true,
      });

      if (insertErr) throw insertErr;

      setSuccessMsg(`Promotion "${trimmedLabel}" (-${parsedPercent}%) activée sur tout le site !`);
      setLabel("");
      setDiscountPercent("20");
      await fetchPromotions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur d'activation";
      setError(`Échec de l'activation : ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Quick preset button click
  const handleQuickPercent = (pct: number) => {
    setDiscountPercent(String(pct));
  };

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-white">
        <RefreshCw className="animate-spin text-[var(--accent)]" size={24} />
        <span className="ml-3">Vérification de la session admin...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Retour & En-tête */}
      <div>
        <Link
          href="/admin"
          className="inline-flex min-h-[48px] items-center gap-2 text-sm font-semibold text-[var(--muted)] transition-colors hover:text-white"
        >
          <ArrowLeft size={18} />
          <span>Retour au catalogue admin</span>
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
              Offre Spéciale Site-Wide
            </span>
            <h1 className="font-heading text-3xl font-bold uppercase text-white sm:text-4xl">
              Gestion de la Promotion
            </h1>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Active une remise immédiate sur l&apos;ensemble des articles du site (bannière catalogue, prix barrés et panier).
            </p>
          </div>
          <button
            type="button"
            onClick={fetchPromotions}
            disabled={loading || submitting}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Messages d'erreur ou de succès */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
        >
          <AlertTriangle size={18} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"
        >
          <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* État de chargement initial */}
      {loading && !activePromo && (
        <div className="space-y-4">
          <div className="h-64 animate-pulse rounded-3xl border border-white/10 bg-[#141822]" />
        </div>
      )}

      {/* Carte Promo Actuellement Active */}
      {!loading && activePromo && (
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 p-6 sm:p-8 text-white shadow-2xl shadow-orange-600/25">
          {/* Arrière-plan stylisé */}
          <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 size-48 rounded-full bg-black/20 blur-2xl" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-100">
                  En ligne sur tout le site
                </span>
              </div>
              <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                Remise automatique
              </span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Taux de réduction
                </span>
                <div className="font-heading text-6xl sm:text-8xl font-black tracking-tight drop-shadow-md">
                  -{activePromo.discount_percent}%
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Libellé affiché aux clients
                </span>
                <p className="mt-1 font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wide">
                  {activePromo.label}
                </p>
                {activePromo.created_at && (
                  <p className="mt-1 text-xs text-white/70">
                    Activée le {new Date(activePromo.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5">
              <p className="text-xs text-white/90">
                La bannière s&apos;affiche actuellement sur la page d&apos;accueil et tous les prix sont automatiquement réduits.
              </p>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={submitting}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-black/80 px-5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-black active:scale-95 disabled:opacity-50"
              >
                <PowerOff size={16} className="text-red-400" />
                <span>{submitting ? "Désactivation..." : "Désactiver la promotion"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire d'activation si aucune promo active */}
      {!loading && !activePromo && (
        <div className="rounded-3xl border border-white/10 bg-[#141822] p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
              <Flame size={22} />
            </span>
            <div>
              <h2 className="font-heading text-xl font-bold uppercase text-white sm:text-2xl">
                Activer une nouvelle promotion
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Aucune promotion n&apos;est active en ce moment. Les prix du site sont normaux.
              </p>
            </div>
          </div>

          <form onSubmit={handleActivate} className="mt-6 space-y-6">
            {/* Libellé */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-white">
                Libellé de la promotion *
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex : SUR TOUT LE CATALOGUE, PROMO DU WEEK-END, SOLDES FLASH..."
                className="w-full rounded-xl border border-white/10 bg-[#0E1116] px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-orange-500"
                required
              />
              <p className="text-[11px] text-[var(--muted)]">
                Ce texte apparaîtra dans la bannière orange du catalogue à côté du pourcentage.
              </p>
            </div>

            {/* Pourcentage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-white">
                  Pourcentage de remise (1 à 90 %) *
                </label>
                <span className="text-xs font-bold text-orange-400">
                  {discountPercent ? `-${discountPercent}%` : ""}
                </span>
              </div>

              <div className="flex gap-3">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="Ex : 20"
                  className="w-full rounded-xl border border-white/10 bg-[#0E1116] px-4 py-3.5 text-sm font-bold text-white outline-none transition focus:border-orange-500"
                  required
                />
              </div>

              {/* Raccourcis de pourcentages */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-[var(--muted)]">Raccourcis rapides :</span>
                {[10, 15, 20, 25, 30, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickPercent(pct)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      discountPercent === String(pct)
                        ? "bg-orange-500 text-white"
                        : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    -{pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 px-6 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-orange-500/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              <Sparkles size={18} />
              <span>{submitting ? "Activation en cours..." : "Activer la promotion"}</span>
            </button>
          </form>
        </div>
      )}

      {/* Historique des promotions passées */}
      {!loading && pastPromos.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-[#141822] p-6 sm:p-8">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4 text-[var(--muted)]">
            <Clock size={16} />
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Historique des promotions récentes
            </h3>
          </div>

          <div className="mt-4 divide-y divide-white/5">
            {pastPromos.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-white/5 px-2.5 py-1 font-heading text-xs font-bold text-orange-300">
                    -{p.discount_percent}%
                  </span>
                  <span className="font-semibold text-white">{p.label}</span>
                </div>
                <span className="text-xs text-[var(--muted)]">
                  {p.created_at
                    ? new Date(p.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
