import { ShoppingBag } from "lucide-react";
import {
	DrawerBody,
	DrawerFooter,
	DrawerHeader,
} from "~/components/ui/shared/Drawer";
import { useEnrichedCart } from "~/hooks/useEnrichedCart";
import { useCart } from "~/lib/cartContext";
import { CartItem } from "./CartItem";
import { CartCheckoutButton, CartSummary } from "./CartSummary";

export function CartDrawerContent() {
	const { cart } = useCart();

	// Enrich cart items with product data from TanStack Query cache
	// This must be called unconditionally (hooks rule)
	const enrichedItems = useEnrichedCart(cart.items);

	return (
		<>
			<DrawerHeader>
				<h5>Shopping Cart</h5>
			</DrawerHeader>

			<DrawerBody>
				{enrichedItems.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full">
						<ShoppingBag size={48} className="text-muted mb-4" />
						<p className="text-muted-foreground">Your cart is empty</p>
					</div>
				) : (
					<div className="space-y-6">
						<div className="space-y-4">
							{enrichedItems.map((item) => (
								<CartItem
									key={`${item.productId}-${item.variationId || "default"}`}
									item={item}
									enrichedItems={enrichedItems}
								/>
							))}
						</div>
						<CartSummary />
					</div>
				)}
			</DrawerBody>

			{enrichedItems.length > 0 && (
				<DrawerFooter>
					<CartCheckoutButton />
				</DrawerFooter>
			)}
		</>
	);
}
