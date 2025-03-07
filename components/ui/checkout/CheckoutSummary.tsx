"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Cart } from "@/lib/context/CartContext";

interface CheckoutSummaryProps {
  cart: Cart;
  isLoading: boolean;
  onPlaceOrder: (e: React.FormEvent) => void;
}

export default function CheckoutSummary({
  cart,
  isLoading,
  onPlaceOrder,
}: CheckoutSummaryProps) {
  // Calculate cart total
  const subtotal = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // You can add tax, shipping calculations here as needed
  const total = subtotal;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Summary</h2>

      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)} CAD</span>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>Shipping</span>
        <span>To be discussed after order</span>
      </div>

      <div className="flex justify-between font-medium text-base pt-2 border-t">
        <span>Total</span>
        <span>${total.toFixed(2)} CAD</span>
      </div>

      <Button
        onClick={onPlaceOrder}
        disabled={cart.items.length === 0 || isLoading}
        className="w-full mt-4"
      >
        {isLoading ? "Processing..." : "Place Order"}
      </Button>
    </div>
  );
}
