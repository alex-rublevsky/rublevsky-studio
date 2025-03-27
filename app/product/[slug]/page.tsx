import { Product } from "@/types";
import getAllProducts from "@/lib/actions/products/getAllProducts";
import getProductBySlug from "@/lib/actions/products/getProductBySlug";
import ProductDetails from "../../../components/ui/store/ProductDetails";

export const revalidate = 2629800; // 1 month

export async function generateStaticParams() {
  const { products } = await getAllProducts();
  return products.map((product: Product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-lg">The requested product could not be found.</p>
        </div>
      </main>
    );
  }

  return <ProductDetails initialProduct={product} />;
}
