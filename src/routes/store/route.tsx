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
  // Fetch complete store data for both cart context and child routes
  const {
    isPending,
    error,
    data: storeData,
  } = useQuery<StoreData>({
    queryKey: ["storeData"],
    staleTime: 1000 * 60 * 60 * 3, // 3 hour
    queryFn: () => fetch(`${DEPLOY_URL}/api/store`).then((res) => res.json()),
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <CartProvider
      initialProducts={storeData?.products}
      initialCategories={storeData?.categories}
      initialTeaCategories={storeData?.teaCategories}
    >
      <Outlet />
      <CartNav />
    </CartProvider>
  );
}
