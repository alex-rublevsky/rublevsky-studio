"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookie, setCookie } from "cookies-next";
import { toast } from "sonner";
import { Product, ProductVariation, ProductWithVariations } from "@/types";
import { validateStock } from "@/lib/utils/validateStock";

// Types
export interface CartItem {
  productId: number;
  productName: string;
  productSlug: string;
  variationId?: number;
  price: number;
  quantity: number;
  image?: string;
  attributes?: Record<string, string>; // e.g. {SIZE_CM: "6x6", COLOR: "Red"}
  maxStock: number; // to validate against stock limits
  unlimitedStock: boolean;
  discount?: number | null; // Percentage discount (e.g., 20 for 20% off)
  weightInfo?: {
    totalWeight: number;
  };
}

export interface Cart {
  items: CartItem[];
  lastUpdated: number;
}

interface CartContextType {
  cart: Cart;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: CartItem) => void;
  addProductToCart: (
    product: Product,
    quantity: number,
    selectedVariation?: ProductVariation | null,
    selectedAttributes?: Record<string, string>
  ) => Promise<boolean>;
  removeFromCart: (productId: number, variationId?: number) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    variationId?: number
  ) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Cookie name constant
const CART_COOKIE_NAME = "rublevsky-cart";

interface CartProviderProps {
  children: React.ReactNode;
  initialProducts: ProductWithVariations[];
}

export function CartProvider({ children, initialProducts }: CartProviderProps) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    lastUpdated: Date.now(),
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load cart from cookie on initial render (client-side only)
  useEffect(() => {
    const savedCart = getCookie(CART_COOKIE_NAME);
    if (savedCart) {
      try {
        setCart(JSON.parse(String(savedCart)));
      } catch (error) {
        console.error("Failed to parse cart cookie:", error);
        // Reset the cart if the cookie is corrupted
        setCart({ items: [], lastUpdated: Date.now() });
      }
    }
    setInitialized(true);
  }, []);

  // Save cart to cookie whenever it changes
  useEffect(() => {
    if (initialized) {
      setCookie(CART_COOKIE_NAME, JSON.stringify(cart), {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }
  }, [cart, initialized]);

  const itemCount = cart.items.reduce(
    (count, item) => count + item.quantity,
    0
  );

  // Add item to cart
  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      // Check if the item is already in the cart
      const existingItemIndex = prevCart.items.findIndex(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.variationId === item.variationId
      );

      let newItems = [...prevCart.items];

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const existingItem = newItems[existingItemIndex];
        const newQuantity = existingItem.quantity + item.quantity;

        // Don't apply stock limits for unlimited stock items
        if (existingItem.unlimitedStock) {
          newItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
          };
        } else {
          // Apply stock limits for limited stock items
          newItems[existingItemIndex] = {
            ...existingItem,
            quantity: Math.min(newQuantity, item.maxStock),
          };
        }
      } else {
        // Item doesn't exist, add it
        if (item.unlimitedStock) {
          newItems.push(item);
        } else {
          // Apply stock limits for limited stock items
          newItems.push({
            ...item,
            quantity: Math.min(item.quantity, item.maxStock),
          });
        }
      }

      return {
        items: newItems,
        lastUpdated: Date.now(),
      };
    });

    // Open the cart drawer when adding an item
    setCartOpen(true);
  };

  // Combined function to add a product to cart using client-side validation
  const addProductToCart = async (
    product: Product,
    quantity: number,
    selectedVariation?: ProductVariation | null,
    selectedAttributes?: Record<string, string>
  ): Promise<boolean> => {
    try {
      // Validate stock using client-side validation
      const result = validateStock(
        initialProducts,
        cart.items,
        product.id,
        quantity,
        selectedVariation?.id
      );

      if (!result.isAvailable && !result.unlimitedStock) {
        toast.error("Requested quantity is not available");
        return false;
      }

      // Create cart item
      const cartItem: CartItem = {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variationId: selectedVariation?.id,
        price: selectedVariation ? selectedVariation.price : product.price,
        quantity: quantity,
        maxStock: result.availableStock,
        unlimitedStock: result.unlimitedStock,
        discount: product.discount,
        image: product.images?.split(",")[0].trim(),
        attributes: selectedAttributes,
        ...(product.weight
          ? {
              weightInfo: {
                totalWeight: parseInt(product.weight),
              },
            }
          : {}),
      };

      addToCart(cartItem);
      return true;
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("Failed to add product to cart");
      return false;
    }
  };

  // Remove item from cart
  const removeFromCart = (productId: number, variationId?: number) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter(
        (item) =>
          !(item.productId === productId && item.variationId === variationId)
      );

      return {
        items: newItems,
        lastUpdated: Date.now(),
      };
    });
  };

  // Update item quantity
  const updateQuantity = async (
    productId: number,
    quantity: number,
    variationId?: number
  ) => {
    // Validate stock using client-side validation
    const result = validateStock(
      initialProducts,
      cart.items,
      productId,
      quantity,
      variationId
    );

    if (!result.isAvailable && !result.unlimitedStock) {
      toast.error("Requested quantity is not available");
      return;
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) => {
        if (item.productId === productId && item.variationId === variationId) {
          // Don't apply stock limits for unlimited stock items
          if (item.unlimitedStock) {
            return {
              ...item,
              quantity: Math.max(1, quantity), // Only enforce minimum of 1
            };
          }
          // Apply stock limits for limited stock items
          return {
            ...item,
            quantity: Math.min(Math.max(1, quantity), result.availableStock),
            maxStock: result.availableStock, // Update maxStock with latest value
          };
        }
        return item;
      });

      return {
        items: newItems,
        lastUpdated: Date.now(),
      };
    });
  };

  // Clear the cart
  const clearCart = () => {
    setCart({
      items: [],
      lastUpdated: Date.now(),
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        setCartOpen,
        addToCart,
        addProductToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
