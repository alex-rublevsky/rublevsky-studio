import FilteredProductList from "@/components/ui/store/filteredProductList";
import getAllProducts from "@/lib/actions/products/getAllProducts";
import { getAllCategories } from "@/lib/actions/categories";
import getAllTeaCategories from "@/lib/actions/tea/getAllTeaCategories";

// Force this page to be dynamically rendered
export const dynamic = "force-dynamic";

export default async function StorePage() {
  // Fetch all products and categories
  const [products, categories, teaCategories] = await Promise.all([
    getAllProducts({}),
    getAllCategories(),
    getAllTeaCategories(),
  ]);

  return (
    <div>
      <FilteredProductList
        products={products}
        categories={categories}
        teaCategories={teaCategories}
      />
    </div>
  );
}
