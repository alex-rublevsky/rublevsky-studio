import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DEPLOY_URL } from "~/utils/store";
import StoreFeed from "~/components/ui/store/FilteredProductList";
import { ProductWithVariations } from "~/types";

export const Route = createFileRoute("/store")({
  component: StorePage,
});

function StorePage() {
  const { isPending, error, data } = useQuery({
    queryKey: ["products"],
    queryFn: () =>
      fetch(`${DEPLOY_URL}/api/products`).then((res) => res.json()),
  });

  if (isPending) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    //<div>{}</div>
    <StoreFeed
      products={data as ProductWithVariations[]}
      //categories={categories || []}
      //teaCategories={teaCategories || []}
      //priceRange={priceRange}
    />
  );
}
