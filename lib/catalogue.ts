export type IphoneModel = {
  id: string;
  name: string;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  category: { name: string; slug: string } | null;
  category_id?: string | null;
  product_type: "case" | "other" | "bracelet";
  model: string | null;
  price: number | null;
  is_active?: boolean;
};

export function normalizeModelName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/^iphone\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isModelMatch(
  productModel: string | null | undefined,
  selectedModelName: string | null | undefined
): boolean {
  if (!productModel || !selectedModelName) return false;
  const normProduct = normalizeModelName(productModel);
  const normSelected = normalizeModelName(selectedModelName);
  return (
    normProduct === normSelected ||
    normSelected.includes(normProduct) ||
    normProduct.includes(normSelected)
  );
}

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return "Prix à confirmer";
  return `${new Intl.NumberFormat("fr-FR").format(price)} FCFA`;
}

export function isBracelet(product: {
  product_type?: string;
  category?: { slug: string; name?: string } | null;
  slug?: string;
  name?: string;
}): boolean {
  if (product.product_type === "bracelet") return true;
  if (product.category?.slug === "bracelets") return true;
  if (product.slug?.toLowerCase().startsWith("bracelet")) return true;
  if (product.name?.toLowerCase().startsWith("bracelet")) return true;
  return false;
}
