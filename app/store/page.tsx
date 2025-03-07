import ProductList from "@/components/ui/store/productList";
import getAllProducts from "@/lib/actions/products/getAllProducts";

// Force this page to be dynamically rendered
export const dynamic = "force-dynamic";

export default async function StorePage() {
  // Fetch all products using the server action
  const products = await getAllProducts({});

  return (
    <div className="space-y-8">
      <ProductList title="All Products" data={products} />
    </div>
  );
}
