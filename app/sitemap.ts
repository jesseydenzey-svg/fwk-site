import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fwk.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/panier`, changeFrequency: "monthly", priority: 0.3 },
  ];

  if (!supabase) return staticRoutes;

  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("is_active", true);

  const productRoutes: MetadataRoute.Sitemap = (data ?? []).map((product) => ({
    url: `${siteUrl}/produits/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}