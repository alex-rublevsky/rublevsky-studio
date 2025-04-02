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

type PageParams = {
  slug: string;
};

export default async function ProductPage(context: {
  params: Promise<PageParams>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await context.params;

  const product = await getProductBySlug(slug);

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
