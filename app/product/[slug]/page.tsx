import { getStoreProductBySlug } from "@/lib/actions/product.actions";
import ProductGallery from "@/components/ui/product/product-gallery";
import ProductInformation from "@/components/ui/product/product-information";
import { notFound } from "next/navigation";
//import { APP_NAME } from "@/lib/constants";

// Add export const dynamic = 'force-dynamic' to prevent static generation
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getStoreProductBySlug(params.slug);
  if (!product) {
    return {
      title: "Product not found",
    };
  }
  return {
    title: `${product.name} —`,
    //TODO: include app name from lib/constants title: `${product.name} — ${APP_NAME}`,

    description: product.description,
  };
}

const ProductDetails = async ({
  params: { slug },
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page: string; color: string; size: string };
}) => {
  const product = await getStoreProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="min-h-screen flex flex-col lg:h-screen lg:overflow-hidden">
      <div className="flex-grow flex items-start justify-center">
        <div className="w-full h-full flex flex-col lg:flex-row gap-0 lg:gap-10 items-start lg:p-4">
          <ProductGallery product={product} />

          <ProductInformation product={product} />
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;
