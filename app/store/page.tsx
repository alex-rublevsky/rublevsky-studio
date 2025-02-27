import ProductList from "@/components/ui/store/productList";
import { getStoreProducts } from "@/lib/actions/product.actions";
import { Product } from "@/types";

// Add export const dynamic = 'force-dynamic' to prevent static generation
export const dynamic = "force-dynamic";

export default async function StorePage() {
  // Fetch all products using server action instead of direct DB access
  const { products: productsWithVariations } = await getStoreProducts({});

  return (
    <div className="space-y-8">
      <ProductList title="Latest Products" data={productsWithVariations} />
    </div>
  );
}
