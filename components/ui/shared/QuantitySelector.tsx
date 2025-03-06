"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";

export interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minQuantity?: number;
  maxQuantity?: number;
  disabled?: boolean;
  size?: "default" | "compact";
}

export function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  minQuantity = 1,
  maxQuantity = Infinity,
  disabled = false,
  size = "default",
}: QuantitySelectorProps) {
  // Determine if buttons should be disabled
  const isDecrementDisabled = disabled || quantity <= minQuantity;
  const isIncrementDisabled = disabled || quantity >= maxQuantity;

  // Size-specific styles
  const sizeStyles = {
    default: {
      container: "space-x-4",
      button: "w-10 h-10 rounded",
      text: "text-2xl",
      quantityText: "text-xl font-medium",
      iconSize: 20,
    },
    compact: {
      container: "space-x-2",
      button: "w-8 h-8 rounded",
      text: "text-sm",
      quantityText: "text-sm",
      iconSize: 14,
    },
  };

  const styles = sizeStyles[size];

  return (
    <div className={`flex items-center ${styles.container}`}>
      <button
        onClick={onDecrement}
        className={`${styles.button} hover:bg-gray-100 transition flex items-center justify-center ${
          isDecrementDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isDecrementDisabled}
        aria-label="Decrease quantity"
      >
        {size === "default" ? (
          <span className={styles.text}>-</span>
        ) : (
          <Minus size={styles.iconSize} />
        )}
      </button>
      <span className={styles.quantityText}>{quantity}</span>
      <button
        onClick={onIncrement}
        className={`${styles.button} hover:bg-gray-100 transition flex items-center justify-center ${
          isIncrementDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isIncrementDisabled}
        aria-label="Increase quantity"
      >
        {size === "default" ? (
          <span className={styles.text}>+</span>
        ) : (
          <Plus size={styles.iconSize} />
        )}
      </button>
    </div>
  );
}
