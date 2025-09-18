//TODO: rename this to store context, since it now includes all store data, even categories and tea categories

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Product,
  ProductVariation,
  ProductWithVariations,
  Category,
  TeaCategory,
} from "~/types";
import { validateStock } from "~/utils/validateStock";
import { setCookie, getCookie } from "~/lib/cookies";

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
  products: ProductWithVariations[]; // Make products directly accessible
  categories: Category[];
  teaCategories: TeaCategory[];
  isLoading: boolean;
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

// Cookie and localStorage constants
const CART_COOKIE_NAME = "rublevsky-cart";
const PRODUCTS_STORAGE_KEY = "rublevsky-products";
const PRODUCTS_TIMESTAMP_KEY = "rublevsky-products-timestamp";
const PRODUCTS_CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

interface CartProviderProps {
  children: React.ReactNode;
  initialProducts?: ProductWithVariations[];
  initialCategories?: Category[];
  initialTeaCategories?: TeaCategory[];
  isLoading?: boolean;
}

export function CartProvider({
  children,
  initialProducts,
  initialCategories = [],
  initialTeaCategories = [],
  isLoading = false,
}: CartProviderProps) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    lastUpdated: Date.now(),
  });
  const [products, setProducts] = useState<ProductWithVariations[]>([]);
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

  // Listen for cart clear events from other parts of the app (like order success page)
  useEffect(() => {
    const handleCartCleared = () => {
      setCart({
        items: [],
        lastUpdated: Date.now(),
      });
    };

    window.addEventListener('cart-cleared', handleCartCleared);
    return () => window.removeEventListener('cart-cleared', handleCartCleared);
  }, []);

  // Load or update products in localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (initialProducts?.length) {
      // If we have initial products, update localStorage
      localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(initialProducts)
      );
      localStorage.setItem(PRODUCTS_TIMESTAMP_KEY, Date.now().toString());
      setProducts(initialProducts);
    } else {
      // Try to load from localStorage if no initial products
      const timestamp = parseInt(
        localStorage.getItem(PRODUCTS_TIMESTAMP_KEY) || "0"
      );
      const isStale = Date.now() - timestamp > PRODUCTS_CACHE_DURATION;

      if (!isStale) {
        try {
          const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
          if (savedProducts) {
            setProducts(JSON.parse(savedProducts));
          }
        } catch (error) {
          console.error("Failed to parse products from localStorage:", error);
        }
      }
    }
  }, [initialProducts]);

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

      const newItems = [...prevCart.items];

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
      // Basic validation
      if (!product || !product.id) {
        toast.error("Invalid product");
        return false;
      }

      if (quantity <= 0) {
        toast.error("Invalid quantity");
        return false;
      }

      // Validate variation requirement
      if (product.hasVariations && !selectedVariation) {
        toast.error("Please select a variation");
        return false;
      }

      if (!product.hasVariations && selectedVariation) {
        toast.error("This product does not support variations");
        return false;
      }

      // Find the product in products state to get the latest data
      const currentProduct = products.find((p) => p.id === product.id);
      if (!currentProduct) {
        toast.error("Product not found");
        return false;
      }

      // Validate variation exists and matches
      if (selectedVariation) {
        const currentVariation = currentProduct.variations?.find(
          (v) => v.id === selectedVariation.id
        );
        if (!currentVariation) {
          toast.error("Selected variation not found");
          return false;
        }
        // Validate variation price matches
        if (currentVariation.price !== selectedVariation.price) {
          toast.error("Product price has changed");
          return false;
        }
      } else {
        // Validate base product price matches
        if (currentProduct.price !== product.price) {
          toast.error("Product price has changed");
          return false;
        }
      }

      // Check if item already exists in cart to determine proper validation
      const existingCartItem = cart.items.find(
        (item) =>
          item.productId === product.id &&
          item.variationId === selectedVariation?.id
      );

      // If item exists, validate the new total quantity (existing + new)
      const totalQuantityAfterAdd = existingCartItem
        ? existingCartItem.quantity + quantity
        : quantity;

      // Validate stock using client-side validation
      const result = validateStock(
        products,
        cart.items,
        product.id,
        totalQuantityAfterAdd,
        selectedVariation?.id,
        !!existingCartItem // Exclude existing item from calculation if it exists
      );

      if (!result.isAvailable && !result.unlimitedStock) {
        toast.error(`Only ${result.availableStock} items available`);
        return false;
      }

      // Create cart item
      const cartItem: CartItem = {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variationId: selectedVariation?.id,
        price: (() => {
          // If product has variations, always use variation price
          if (product.hasVariations && selectedVariation) {
            return selectedVariation.price;
          }
          // If product price is zero, use variation price (if available)
          if (product.price === 0 && selectedVariation) {
            return selectedVariation.price;
          }
          return selectedVariation ? selectedVariation.price : product.price;
        })(),
        quantity: quantity,
        maxStock: result.unlimitedStock
          ? Number.MAX_SAFE_INTEGER
          : result.availableStock,
        unlimitedStock: result.unlimitedStock,
        discount: selectedVariation?.discount || product.discount,
        image: product.images && typeof product.images === 'string' 
          ? product.images.split(",")[0]?.trim() || undefined 
          : undefined,
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
      products,
      cart.items,
      productId,
      quantity,
      variationId,
      true // Add isExistingCartItem flag as true
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
        products, // Use products from state
        categories: initialCategories,
        teaCategories: initialTeaCategories,
        isLoading,
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
