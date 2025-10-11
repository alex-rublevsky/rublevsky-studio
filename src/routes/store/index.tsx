import { createFileRoute } from "@tanstack/react-router";
import StoreFeed from "~/components/ui/store/StoreFeed";
import { useCart } from "~/lib/cartContext";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/store/")({
	component: StorePage,
	head: () => ({
		meta: [
			...seo({
				title: "Store - Rublevsky Studio",
				description:
					"Tea, handmade clothing prints, posters, and stickers. Premium quality products for tea enthusiasts and design lovers.",
			}),
		],
	}),
});

function StorePage() {
	// Get store data from cart context (which is now available since we're inside CartProvider)
	const { products, categories, teaCategories } = useCart();

	return (
		<main>
			<StoreFeed
				products={products}
				categories={categories}
				teaCategories={teaCategories}
			/>
		</main>
	);
}
