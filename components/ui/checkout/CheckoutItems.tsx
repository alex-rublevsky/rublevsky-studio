"use client";

import React from "react";
import Image from "next/image";
import { CartItem } from "@/lib/context/CartContext";
import { getAttributeDisplayName } from "@/lib/utils/productAttributes";

interface CheckoutItemsProps {
  items: CartItem[];
}

export default function CheckoutItems({ items }: CheckoutItemsProps) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">No items in cart</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={`${item.productId}-${item.variationId || "default"}`}
          className="flex items-start gap-3 py-2"
        >
          {/* Product image */}
          <div className="shrink-0 relative w-12 h-12 bg-muted rounded overflow-hidden">
            {item.image ? (
              <Image
                src={`/${item.image}`}
                alt={item.productName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="grow">
            <p className="font-medium text-sm">{item.productName}</p>

            {item.attributes && Object.keys(item.attributes).length > 0 && (
              <p className="text-xs text-muted-foreground">
                {Object.entries(item.attributes)
                  .map(
                    ([key, value]) =>
                      `${getAttributeDisplayName(key)}: ${value}`
                  )
                  .join(", ")}
              </p>
            )}
          </div>

          {/* Quantity and price */}
          <div className="text-right">
            {item.discount ? (
              <>
                <p className="text-sm font-medium line-through text-muted-foreground">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <div className="flex items-center justify-end gap-2">
                  <p className="text-sm font-medium">
                    $
                    {(
                      item.price *
                      (1 - item.discount / 100) *
                      item.quantity
                    ).toFixed(2)}
                  </p>
                  <span className="text-xs text-red-600">
                    {item.discount}% OFF
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Qty: {item.quantity}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
