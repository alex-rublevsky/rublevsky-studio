"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useCart, CartItem as CartItemType } from "@/lib/context/CartContext";
import { QuantitySelector } from "@/components/ui/shared/QuantitySelector";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart, cart } = useCart();

  // Calculate effective max quantity for weight-based products
  const effectiveMaxQuantity = useMemo(() => {
    if (item.unlimitedStock) return undefined;

    // For weight-based products
    if (item.weightInfo) {
      const { totalWeight } = item.weightInfo;
      const currentVariationWeight = parseInt(
        item.attributes?.["WEIGHT_G"] || "0"
      );

      if (currentVariationWeight) {
        // Calculate total weight used by all variations in cart EXCEPT current item
        const weightUsedInCart = cart.items
          .filter(
            (cartItem) =>
              cartItem.productId === item.productId &&
              // Exclude current item from calculation
              !(cartItem.variationId === item.variationId)
          )
          .reduce((total, cartItem) => {
            const cartItemWeight = cartItem.attributes?.["WEIGHT_G"];
            if (cartItemWeight) {
              return total + parseInt(cartItemWeight) * cartItem.quantity;
            }
            return total;
          }, 0);

        // Calculate remaining weight (excluding current item's usage)
        const remainingWeight = Math.max(0, totalWeight - weightUsedInCart);

        // Calculate how many packages of current variation can be made
        return Math.floor(remainingWeight / currentVariationWeight);
      }
    }

    // For regular products, use the maxStock from the item
    return item.maxStock;
  }, [item, cart.items]);

  const handleIncrement = () => {
    if (item.unlimitedStock || item.quantity < effectiveMaxQuantity!) {
      updateQuantity(item.productId, item.quantity + 1, item.variationId);
    }
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
            src={`/${item.image}`}
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
          <QuantitySelector
            quantity={item.quantity}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            maxQuantity={effectiveMaxQuantity}
            size="compact"
          />
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
