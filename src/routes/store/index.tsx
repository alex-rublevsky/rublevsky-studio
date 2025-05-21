import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DEPLOY_URL } from "~/utils/store";
import StoreFeed from "~/components/ui/store/StoreFeed";
import { ProductWithVariations } from "~/types";
import { CartProvider } from "~/lib/cartContext";

interface StoreData {
  products: ProductWithVariations[];
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    image: string | null;
    isActive: boolean;
  }>;
  teaCategories: Array<{
    slug: string;
    name: string;
    isActive: boolean;
  }>;
}

export const Route = createFileRoute("/store/")({
  component: StorePage,
});

function StorePage() {
  const { isPending, error, data } = useQuery<StoreData>({
    queryKey: ["storeData"],
    staleTime: 1000 * 60 * 60 * 1, // 1 hour
    queryFn: () => fetch(`${DEPLOY_URL}/api/store`).then((res) => res.json()),
  });

  if (isPending) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <CartProvider>
      <StoreFeed
        products={data.products}
        categories={data.categories}
        teaCategories={data.teaCategories}
      />
    </CartProvider>
  );
}
