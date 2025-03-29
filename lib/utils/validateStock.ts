import { CartItem } from "@/lib/context/CartContext";
import { Product, ProductWithVariations } from "@/types";

export interface StockValidationResult {
  isAvailable: boolean;
  availableStock: number;
  unlimitedStock: boolean;
  error?: string;
}

/**
 * Calculates total quantity of a product/variation in cart, excluding the current item being validated
 */
function getCartQuantity(
  cartItems: CartItem[],
  productId: number,
  variationId?: number,
  excludeCurrentItem: boolean = false
): number {
  return cartItems
    .filter(item => {
      const isMatch = item.productId === productId && item.variationId === variationId;
      // If we're excluding the current item, return false for the first match
      if (excludeCurrentItem && isMatch) {
        excludeCurrentItem = false; // Only exclude one item
        return false;
      }
      return isMatch;
    })
    .reduce((total, item) => total + item.quantity, 0);
}

/**
 * Validates stock availability for both regular and weight-based products
 */
export function validateStock(
  products: ProductWithVariations[],
  cartItems: CartItem[],
  productId: number,
  requestedQuantity: number = 1,
  variationId?: number,
  isExistingCartItem: boolean = false
): StockValidationResult {
  // Find the product
  const product = products.find(p => p.id === productId);
  if (!product) {
    return {
      isAvailable: false,
      availableStock: 0,
      unlimitedStock: false,
      error: `Product not found: ${productId}`
    };
  }

  // Handle unlimited stock products
  if (product.unlimitedStock) {
    return {
      isAvailable: true,
      availableStock: Number.MAX_SAFE_INTEGER,
      unlimitedStock: true
    };
  }

  // Get current quantity in cart, excluding the item being validated if it's an existing cart item
  const cartQuantity = getCartQuantity(cartItems, productId, variationId, isExistingCartItem);

  // Handle weight-based products with variations
  if (product.weight && variationId) {
    const variation = product.variations?.find(v => v.id === variationId);
    if (!variation) {
      return {
        isAvailable: false,
        availableStock: 0,
        unlimitedStock: false,
        error: `Variation not found: ${variationId}`
      };
    }

    const weightAttr = variation.attributes.find(attr => attr.attributeId === "WEIGHT_G");
    if (!weightAttr) {
      return {
        isAvailable: false,
        availableStock: 0,
        unlimitedStock: false,
        error: "Missing weight attribute for variation"
      };
    }

    const totalWeight = parseInt(product.weight || "0");
    const variationWeight = parseInt(weightAttr.value);

    // Calculate total weight used by other variations, excluding the current item if it's an existing cart item
    const otherVariationsWeight = cartItems
      .filter(item => {
        const isOtherVariation = item.productId === productId && 
          item.variationId !== variationId &&
          item.attributes?.["WEIGHT_G"];
        
        // If this is the item being validated and we should exclude it, skip it
        if (isExistingCartItem && item.productId === productId && item.variationId === variationId) {
          return false;
        }
        
        return isOtherVariation;
      })
      .reduce((total, item) => {
        return total + (parseInt(item.attributes!["WEIGHT_G"]) * item.quantity);
      }, 0);

    const availableWeight = totalWeight - otherVariationsWeight;
    const requestedWeight = variationWeight * requestedQuantity;
    const maxPossibleQuantity = Math.floor(availableWeight / variationWeight);

    return {
      isAvailable: availableWeight >= requestedWeight,
      availableStock: maxPossibleQuantity,
      unlimitedStock: false,
      error: availableWeight >= requestedWeight ? undefined : 
        `Insufficient weight available. Maximum possible quantity: ${maxPossibleQuantity}`
    };
  }

  // Handle regular variations or base products
  const stockToCheck = variationId 
    ? product.variations?.find(v => v.id === variationId)?.stock
    : product.stock;

  if (typeof stockToCheck !== 'number') {
    return {
      isAvailable: false,
      availableStock: 0,
      unlimitedStock: false,
      error: variationId 
        ? `Variation not found: ${variationId}`
        : `Invalid stock value for product: ${productId}`
    };
  }

  const availableStock = Math.max(0, stockToCheck - cartQuantity);
  const canFulfill = availableStock >= requestedQuantity;

  return {
    isAvailable: canFulfill,
    availableStock,
    unlimitedStock: false,
    error: canFulfill ? undefined : 
      `Insufficient stock. Available: ${availableStock}, Requested: ${requestedQuantity}`
  };
}

/**
 * Validates a specific variation exists and is valid for a product
 */
export function validateVariation(
  product: ProductWithVariations,
  variationId: number | undefined
): { isValid: boolean; error?: string } {
  // Check if product requires variations
  if (product.hasVariations && !variationId) {
    return { isValid: false, error: `Variation required for product: ${product.name}` };
  }

  if (!product.hasVariations && variationId) {
    return { isValid: false, error: `Product does not support variations: ${product.name}` };
  }

  // If variation is required, validate it exists
  if (variationId) {
    const variation = product.variations?.find(v => v.id === variationId);
    if (!variation) {
      return { isValid: false, error: `Variation not found for product: ${product.name}` };
    }
  }

  return { isValid: true };
} 