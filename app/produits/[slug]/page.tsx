import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductView from "@/components/product-view";
import type { IphoneModel, Product } from "@/lib/catalogue";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fwk.example.com";
const fallbackImage = `${siteUrl}/opengraph-image.png`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!supabase) return { title: "Produit | FRANCK WATAT CASE" };

  const { data: product } = await supabase
    .from("products")
    .select("name, description, image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!product) return { title: "Produit introuvable | FRANCK WATAT CASE" };

  const title = `${product.name} | FRANCK WATAT CASE`;
  const description =
    product.description || `Découvre ${product.name} par FRANCK WATAT CASE.`;
  const image = product.image_url || fallbackImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_FR",
      images: [{ url: image, width: 1200, height: 1200, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!supabase) {
    notFound();
  }

  const [productRes, modelsRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, slug, description, image_url, category:categories(name, slug), product_type, model, price, is_active"
      )
      .eq("slug", slug)
      .maybeSingle(),
    supabase
      .from("iphone_models")
      .select("id, name, sort_order")
      .order("sort_order"),
  ]);

  if (productRes.error || !productRes.data) {
    notFound();
  }

  const product = productRes.data as unknown as Product;
  const models = (modelsRes.data ?? []) as unknown as IphoneModel[];

  return <ProductView product={product} models={models} />;
}