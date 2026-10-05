import { supabase } from "@/lib/supabase";
import type { IphoneModel, Product } from "@/lib/catalogue";
import Catalogue from "@/components/catalogue";

export default async function Home() {
  let models: IphoneModel[] = [];
  let products: Product[] = [];
  let errorMessage: string | null = null;

  if (!supabase) {
    errorMessage = "Le catalogue est momentanément indisponible. Réessaie dans quelques instants.";
  } else {
    try {
      const [modelResult, productResult] = await Promise.all([
        supabase.from("iphone_models").select("id, name, sort_order").order("sort_order"),
        supabase
          .from("products")
          .select("id, name, slug, description, image_url, category:categories(name, slug), product_type, model, price, is_active")
          .order("created_at", { ascending: false }),
      ]);

      if (modelResult.error) throw modelResult.error;
      if (productResult.error) throw productResult.error;
      models = (modelResult.data ?? []) as unknown as IphoneModel[];
      products = (productResult.data ?? []) as unknown as Product[];
    } catch {
      errorMessage = "Impossible de charger le catalogue. Vérifie ta connexion puis réessaie.";
    }
  }

  return <Catalogue models={models} products={products} errorMessage={errorMessage} />;
}
