"use client";

import React, { useState } from "react";
import { useCart } from "@/lib/context/CartContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CartSummary() {
  const { cart, setCartOpen } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Calculate cart total
  const subtotal = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // You can add tax, shipping calculations here as needed
  const total = subtotal;

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;

    setIsLoading(true);

    try {
      // Close the cart drawer
      setCartOpen(false);

      // Redirect to checkout page
      router.push("/checkout");
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      {/* Add other cost lines as needed (shipping, tax, etc.) */}

      <div className="flex justify-between font-medium text-base pt-2 border-t">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <Button
        onClick={handleCheckout}
        disabled={cart.items.length === 0 || isLoading}
        className="w-full mt-4"
      >
        {isLoading ? "Processing..." : "Checkout"}
      </Button>

      <p className="text-xs text-center text-gray-500 mt-2">
        Prices and shipping calculated at checkout
      </p>
    </div>
  );
}
