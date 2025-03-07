"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookie, setCookie } from "cookies-next";
import { toast } from "sonner";
import { Product, ProductVariation } from "@/types";
import { validateStock } from "@/lib/actions/cart/validateStock";

// Types
export interface CartItem {
  productId: number;
  productName: string;
  productSlug: string;
  variationId?: number;
  price: number;
  quantity: number;
  image?: string;
  attributes?: Record<string, string>; // e.g. {color: "red", size: "XL"}
  maxStock: number; // to validate against stock limits
  unlimitedStock: boolean;
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

export function CartProvider({ children }: { children: React.ReactNode }) {
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

  // Combined function to add a product to cart using the server action for validation
  const addProductToCart = async (
    product: Product,
    quantity: number = 1,
    selectedVariation?: ProductVariation | null,
    selectedAttributes?: Record<string, string>
  ) => {
    try {
      // For products with variations without a selected variation, show a message
      if (product.hasVariations && !selectedVariation) {
        toast.info("Please select product options first");
        return false;
      }

      // Validate stock availability using server action
      const result = await validateStock(
        product.id,
        quantity,
        selectedVariation?.id
      );

      if (!result.isAvailable && !result.unlimitedStock) {
        toast.error(
          "This item is out of stock or not available in the requested quantity"
        );
        return false;
      }

      // Get first product image
      const firstImage = product.images
        ? product.images.split(",")[0].trim()
        : "";

      // Create cart item
      const cartItem: CartItem = {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variationId: selectedVariation?.id,
        price: selectedVariation ? selectedVariation.price : product.price,
        quantity: quantity,
        image: firstImage,
        attributes: selectedAttributes || {},
        maxStock: result.availableStock,
        unlimitedStock: result.unlimitedStock,
      };

      // Add to cart
      addToCart(cartItem);
      toast.success("Added to cart");
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
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
  const updateQuantity = (
    productId: number,
    quantity: number,
    variationId?: number
  ) => {
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
            quantity: Math.min(Math.max(1, quantity), item.maxStock),
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
