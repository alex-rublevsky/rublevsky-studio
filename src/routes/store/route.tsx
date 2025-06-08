import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CartProvider } from "~/lib/cartContext";
import { useQuery } from "@tanstack/react-query";
import { DEPLOY_URL } from "~/utils/store";
import { ProductWithVariations, Category, TeaCategory } from "~/types";
import { CartNav } from "~/components/ui/store/CartNav";


interface StoreData {
  products: ProductWithVariations[];
  categories: Category[];
  teaCategories: TeaCategory[];
}

export const Route = createFileRoute("/store")({
  component: StoreLayout,
});

function StoreLayout() {
  // Use TanStack Query for better caching and data management
  const {
    isPending,
    error,
    data: storeData,
  } = useQuery<StoreData>({
    queryKey: ["storeData"],
    queryFn: async () => {
      const response = await fetch(`${DEPLOY_URL}/api/store`);
      if (!response.ok) {
        throw new Error(`Failed to fetch store data: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    retry: 3,
    refetchOnWindowFocus: false,
  });

  if (error) {
    return (
//TODO: style this, then apply to all errors
      <div className="min-h-screen bg-background">
      Failed to load products!
      </div>
    );
  }

  // Always render CartProvider, even while loading
  // This prevents the mobile navigation hanging issue
  return (
    <CartProvider
      initialProducts={storeData?.products || []}
      initialCategories={storeData?.categories || []}
      initialTeaCategories={storeData?.teaCategories || []}
      isLoading={isPending}
    >
      <Outlet />
      <CartNav />
    </CartProvider>
  );
}
