import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CartNav } from "~/components/ui/store/CartNav";
import { StorePageSkeleton } from "~/components/ui/store/skeletons/StorePageSkeleton";
import { CartProvider } from "~/lib/cartContext";
import { storeDataQueryOptions } from "~/lib/queryOptions";

export const Route = createFileRoute("/store")({
	component: StoreLayout,
	pendingComponent: StorePageSkeleton,
	// Prefetch store data before component renders
	loader: async ({ context: { queryClient } }) => {
		await queryClient.ensureQueryData(storeDataQueryOptions());
	},
});

function StoreLayout() {
	// Data is guaranteed to be loaded by the loader
	// CartProvider no longer needs products - they're managed by TanStack Query
	return (
		<CartProvider>
			<Outlet />
			<CartNav />
		</CartProvider>
	);
}
