"use client";

import React from "react";
import { useCart } from "@/lib/context/CartContext";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { ShoppingBag } from "lucide-react";

export function CartDrawerContent() {
  let cartContext;

  try {
    cartContext = useCart();
  } catch {
    // If we're not within a CartProvider, show empty cart
    return (
      <div className="p-6 h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
        <div className="flex-1 flex flex-col items-center justify-center">
          <ShoppingBag size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      </div>
    );
  }

  const { cart } = cartContext;

  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>

      {cart.items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <ShoppingBag size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            {cart.items.map((item) => (
              <CartItem
                key={`${item.productId}-${item.variationId || "default"}`}
                item={item}
              />
            ))}
          </div>
          <CartSummary />
        </>
      )}
    </div>
  );
}
