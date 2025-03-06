"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus } from "lucide-react";
import { useCart, CartItem as CartItemType } from "@/lib/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleIncrement = () => {
    updateQuantity(item.productId, item.quantity + 1, item.variationId);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1, item.variationId);
    }
  };

  // Format attributes for display
  const attributeText = item.attributes
    ? Object.entries(item.attributes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")
    : "";

  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100">
      {/* Product image */}
      <div className="flex-shrink-0 relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.productName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-grow">
        <Link
          href={`/product/${item.productSlug}`}
          className="font-medium hover:underline"
        >
          {item.productName}
        </Link>

        {attributeText && (
          <p className="text-sm text-gray-500 mt-1">{attributeText}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-gray-200 rounded">
            <button
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
              className="p-1 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="px-2 min-w-8 text-center">{item.quantity}</span>
            <button
              onClick={handleIncrement}
              disabled={item.quantity >= item.maxStock}
              className="p-1 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="font-medium">
            ${(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={() => removeFromCart(item.productId, item.variationId)}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
        aria-label="Remove item"
      >
        <X size={16} />
      </button>
    </div>
  );
}
