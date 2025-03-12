import { CartItem } from "@/lib/context/CartContext";
import { Product, ProductWithVariations } from "@/types";

export interface StockValidationResult {
  isAvailable: boolean;
  availableStock: number;
  unlimitedStock: boolean;
}

/**
 * Client-side stock validation that uses cached product data instead of making database calls
 */
export function validateStock(
  products: ProductWithVariations[],
  cartItems: CartItem[],
  productId: number,
  requestedQuantity: number = 1,
  variationId?: number
): StockValidationResult {
  // Find the product
  const product = products.find(p => p.id === productId);
  if (!product) {
    return { isAvailable: false, availableStock: 0, unlimitedStock: false };
  }

  // If product has unlimited stock, always return true
  if (product.unlimitedStock) {
    return {
      isAvailable: true,
      availableStock: Number.MAX_SAFE_INTEGER,
      unlimitedStock: true
    };
  }

  // For weight-based products with variations
  if (product.weight && variationId) {
    const variation = product.variations?.find(v => v.id === variationId);
    if (!variation) return { isAvailable: false, availableStock: 0, unlimitedStock: false };

    const weightAttr = variation.attributes.find(attr => attr.attributeId === "WEIGHT_G");
    if (!weightAttr) return { isAvailable: false, availableStock: 0, unlimitedStock: false };

    const totalWeight = parseInt(product.weight);
    const variationWeight = parseInt(weightAttr.value);

    // Calculate total weight used by all variations in cart
    const weightUsedInCart = cartItems
      .filter((item) => item.productId === product.id)
      .reduce((total, item) => {
        // Skip the current variation if we're updating its quantity
        if (item.variationId === variationId) {
          return total;
        }
        // Find the weight of other cart items' variations
        const cartItemWeight = item.attributes?.["WEIGHT_G"];
        if (cartItemWeight) {
          return total + parseInt(cartItemWeight) * item.quantity;
        }
        return total;
      }, 0);

    // Add the weight that would be used by the requested quantity
    const requestedWeight = variationWeight * requestedQuantity;
    const totalRequestedWeight = weightUsedInCart + requestedWeight;

    // Check if the total requested weight exceeds the available weight
    if (totalRequestedWeight > totalWeight) {
      const remainingWeight = Math.max(0, totalWeight - weightUsedInCart);
      const availableStock = Math.floor(remainingWeight / variationWeight);
      return {
        isAvailable: false,
        availableStock,
        unlimitedStock: false
      };
    }

    // Calculate how many more packages can be made after this request
    const remainingWeight = totalWeight - totalRequestedWeight;
    const additionalAvailableStock = Math.floor(remainingWeight / variationWeight);

    return {
      isAvailable: true,
      availableStock: requestedQuantity + additionalAvailableStock,
      unlimitedStock: false
    };
  }

  // For regular variations
  if (variationId && product.variations) {
    const variation = product.variations.find(v => v.id === variationId);
    if (!variation) {
      return { isAvailable: false, availableStock: 0, unlimitedStock: false };
    }

    // Find matching cart item
    const cartItem = cartItems.find(
      item => item.productId === productId && item.variationId === variationId
    );

    const effectiveStock = cartItem 
      ? Math.max(0, variation.stock - cartItem.quantity)
      : variation.stock;

    return {
      isAvailable: effectiveStock >= requestedQuantity,
      availableStock: effectiveStock,
      unlimitedStock: false
    };
  }

  // For regular products (no variations)
  const cartItem = cartItems.find(
    item => item.productId === productId && !item.variationId
  );

  const effectiveStock = cartItem 
    ? Math.max(0, product.stock - cartItem.quantity)
    : product.stock;

  return {
    isAvailable: effectiveStock >= requestedQuantity,
    availableStock: effectiveStock,
    unlimitedStock: false
  };
} 