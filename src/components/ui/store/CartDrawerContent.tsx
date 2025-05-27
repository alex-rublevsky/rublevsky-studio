import { useCart } from "~/lib/cartContext";
import { CartItem } from "./CartItem";
import { CartSummary, CartCheckoutButton } from "./CartSummary";
import { ShoppingBag } from "lucide-react";
import {
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "~/components/ui/shared/Drawer";

export function CartDrawerContent() {
  const cartContext = useCart();

  // If we're not within a CartProvider, show empty cart
  if (!cartContext) {
    return (
      <>
        <DrawerHeader>
          <h5>Shopping Cart</h5>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex flex-col items-center justify-center h-full">
            <ShoppingBag size={48} className="text-muted mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        </DrawerBody>
      </>
    );
  }

  const { cart } = cartContext;

  return (
    <>
      <DrawerHeader>
        <h5>Shopping Cart</h5>
      </DrawerHeader>

      <DrawerBody>
        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <ShoppingBag size={48} className="text-muted mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItem
                  key={`${item.productId}-${item.variationId || "default"}`}
                  item={item}
                />
              ))}
            </div>
            <CartSummary />
          </div>
        )}
      </DrawerBody>

      {cart.items.length > 0 && (
        <DrawerFooter>
          <CartCheckoutButton />
        </DrawerFooter>
      )}
    </>
  );
}
