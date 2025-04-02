import getAllProducts from "@/lib/actions/products/getAllProducts";
import { getAllCategories } from "@/lib/actions/categories";
import getAllTeaCategories from "@/lib/actions/tea/getAllTeaCategories";
import StoreFeed from "@/components/ui/store/filteredProductList";

export const experimental_ppr = true;

// Force this page to be dynamically rendered
export const dynamic = "force-dynamic";

export default async function StorePage() {
  // Fetch all products and categories
  const [productsData, categories, teaCategories] = await Promise.all([
    getAllProducts({ includePriceRange: true }),
    getAllCategories(),
    getAllTeaCategories(),
  ]);

  return (
    <StoreFeed
      products={productsData.products}
      categories={categories}
      teaCategories={teaCategories}
      priceRange={productsData.priceRange}
    />
  );
}
