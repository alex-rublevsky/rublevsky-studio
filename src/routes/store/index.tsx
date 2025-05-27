import { createFileRoute } from "@tanstack/react-router";
import StoreFeed from "~/components/ui/store/StoreFeed";
import { useCart } from "~/lib/cartContext";

export const Route = createFileRoute("/store/")({
  component: StorePage,
});

function StorePage() {
  // Get store data from cart context (which now includes all store data)
  const { products, categories, teaCategories } = useCart();

  return (
    <StoreFeed
      products={products}
      categories={categories}
      teaCategories={teaCategories}
    />
  );
}
