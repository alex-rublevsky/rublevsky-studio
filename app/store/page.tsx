import ProductList from "@/components/ui/store/productList";
import getAllProducts from "@/lib/actions/getAllProducts";

export default async function StorePage() {
  // Fetch all products using the server action
  const products = await getAllProducts({});

  return (
    <div className="space-y-8">
      <ProductList title="Latest Products" data={products} />
    </div>
  );
}
