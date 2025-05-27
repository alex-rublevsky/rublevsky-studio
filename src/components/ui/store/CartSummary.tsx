import React, { useState } from "react";
import { useCart } from "~/lib/cartContext";
import { Button } from "~/components/ui/shared/Button";
import { useRouter } from "@tanstack/react-router";

export function CartSummary() {
  const { cart } = useCart();

  // Calculate cart totals with discounts
  const subtotal = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const discountTotal = cart.items.reduce((total, item) => {
    if (item.discount) {
      return total + (item.price * item.quantity * item.discount) / 100;
    }
    return total;
  }, 0);

  const total = subtotal - discountTotal;

  return (
    <div className="space-y-2 pb-0">
      <div className="flex justify-between text-sm">
        <p>Subtotal</p>
        <p>${subtotal.toFixed(2)}</p>
      </div>

      {discountTotal > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <p>Discount</p>
          <p>-${discountTotal.toFixed(2)}</p>
        </div>
      )}

      <div className="flex justify-between">
        <span>Total</span>
        <h4>${total.toFixed(2)}</h4>
      </div>

      <p className="text-xs text-muted-foreground text-center pt-2">
        Shipping will be calculated at checkout
      </p>
    </div>
  );
}

export function CartCheckoutButton() {
  const { cart, setCartOpen } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Calculate total with discounts
  const subtotal = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const discountTotal = cart.items.reduce((total, item) => {
    if (item.discount) {
      return total + (item.price * item.quantity * item.discount) / 100;
    }
    return total;
  }, 0);

  const total = subtotal - discountTotal;

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;

    setIsLoading(true);

    try {
      // Close the cart drawer
      setCartOpen(false);

      // Redirect to checkout page
      //TODO: fix
      //router.redirect("/checkout");
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={cart.items.length === 0 || isLoading}
      className="w-full"
    >
      {isLoading ? "Processing..." : `Checkout $${total.toFixed(2)}`}
    </Button>
  );
}
