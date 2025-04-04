"use client";

import { Product, ProductVariation, VariationAttribute } from "@/types";
import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";
import styles from "./productCard.module.css";
import { useCart } from "@/lib/context/CartContext";
import { useCallback, useRef } from "react";
import { getAttributeDisplayName } from "@/lib/utils/productAttributes";
import { Badge } from "../shared/badge";
import { FilterGroup } from "../shared/FilterGroup";
import { getAvailableQuantityForVariation } from "@/lib/utils/validateStock";
import { useVariationSelection } from "@/lib/hooks/useVariationSelection";

// Extended product interface with variations
interface ProductWithVariations extends Product {
  variations?: ProductVariationWithAttributes[];
}

interface ProductVariationWithAttributes extends ProductVariation {
  attributes: VariationAttribute[];
}

function ProductCard({ product }: { product: ProductWithVariations }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addProductToCart, cart } = useCart();

  // Use the variation selection hook
  const {
    selectedVariation,
    selectedAttributes,
    selectVariation,
    isAttributeValueAvailable,
  } = useVariationSelection({
    product,
    cartItems: cart.items,
  });

  // Ref for debouncing hover state
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  // Add a ref for the variations container
  const variationsRef = useRef<HTMLDivElement>(null);

  // Convert comma-separated string to array, or empty array if null
  const imageArray = useMemo(
    () => product.images?.split(",").map((img) => img.trim()) ?? [],
    [product.images]
  );

  // Get unique attribute values for a specific attribute ID
  const getUniqueAttributeValues = useCallback(
    (attributeId: string): string[] => {
      if (!product.variations) return [];

      // Sort variations by sort property (descending order)
      const sortedVariations = [...product.variations].sort(
        (a, b) => (b.sort ?? 0) - (a.sort ?? 0)
      );

      const values = new Set<string>();
      sortedVariations.forEach((variation) => {
        const attribute = variation.attributes.find(
          (attr) => attr.attributeId === attributeId
        );
        if (attribute) {
          values.add(attribute.value);
        }
      });

      return Array.from(values);
    },
    [product.variations]
  );

  // Calculate effective stock by subtracting cart quantities
  const getEffectiveStock = useMemo(() => {
    if (!product) return 0;

    return getAvailableQuantityForVariation(
      product,
      selectedVariation?.id,
      cart.items
    );
  }, [product, selectedVariation, cart.items]);

  // Calculate if the product is available to add to cart
  const isAvailable = useMemo(() => {
    return (
      product.isActive && (product.unlimitedStock || getEffectiveStock > 0)
    );
  }, [product.isActive, product.unlimitedStock, getEffectiveStock]);

  // Calculate current price based on selected variation
  const currentPrice = useMemo(() => {
    return selectedVariation ? selectedVariation.price : product.price;
  }, [selectedVariation, product.price]);

  // Get attribute names to display in the card
  const attributeNames = useMemo(() => {
    if (!product.variations) return [];

    const attributeNames = new Set<string>();
    product.variations.forEach((variation) => {
      variation.attributes.forEach((attr: VariationAttribute) => {
        attributeNames.add(attr.attributeId);
      });
    });

    return Array.from(attributeNames);
  }, [product.variations]);

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!isAvailable) return;

      setIsAddingToCart(true);

      try {
        // Use the context function directly
        await addProductToCart(
          product,
          1, // Default quantity of 1 when adding from product card
          selectedVariation,
          selectedAttributes
        );
      } catch (error) {
        console.error("Error adding to cart:", error);
      } finally {
        setIsAddingToCart(false);
      }
    },
    [
      isAvailable,
      addProductToCart,
      product,
      selectedVariation,
      selectedAttributes,
    ]
  );

  // Check if product is coming soon (not in the type, so we'll use a placeholder)
  const isComingSoon = false; // Replace with actual logic when available

  // Debounced handlers for hovering
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    hoverTimeout.current = setTimeout(() => {
      setIsHovering(true);
    }, 100);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    hoverTimeout.current = setTimeout(() => {
      setIsHovering(false);
    }, 100);
  }, []);

  // Handle card click
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // If the click originated from within the variations container, prevent navigation
    if (variationsRef.current?.contains(e.target as Node)) {
      e.preventDefault();
    }
  }, []);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="block h-full relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      <div
        className="w-full product-card overflow-hidden rounded-lg group"
        id={styles.productCard}
      >
        <div className="bg-background flex flex-col">
          <div className="relative aspect-square overflow-hidden">
            <div>
              {/* Primary Image */}
              <div className="relative aspect-square flex items-center justify-center overflow-hidden">
                {imageArray.length > 0 ? (
                  <Image
                    src={`/${imageArray[0]}`}
                    alt={product.name}
                    fill
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ease-in-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </div>

              {/* Secondary Image (if exists) */}
              {imageArray.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={`/${imageArray[1]}`}
                    alt={product.name}
                    fill
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-in-out ${
                      isHovering ? "opacity-100" : "opacity-0"
                    }`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
            </div>

            {/* Desktop Add to Cart button */}
            <button
              onClick={handleAddToCart}
              className={`absolute bottom-0 left-0 right-0 hidden md:flex items-center justify-center space-x-2 bg-muted/70 backdrop-blur-xs text-black hover:bg-black  transition-all duration-500 py-2 opacity-0 group-hover:opacity-100 ${
                !isAvailable
                  ? "cursor-not-allowed hover:bg-muted/70 opacity-50"
                  : "hover:text-white"
              }`}
              disabled={!isAvailable}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 33 30"
                className="cart-icon"
              >
                <path
                  d="M1.94531 1.80127H7.27113L11.9244 18.602C12.2844 19.9016 13.4671 20.8013 14.8156 20.8013H25.6376C26.9423 20.8013 28.0974 19.958 28.495 18.7154L31.9453 7.9303H19.0041"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="13.4453" cy="27.3013" r="2.5" fill="currentColor" />
                <circle cx="26.4453" cy="27.3013" r="2.5" fill="currentColor" />
              </svg>
              {!isAddingToCart ? (
                <span>
                  {!isAvailable
                    ? "Out of Stock"
                    : isComingSoon
                      ? "Pre-order"
                      : "Add to Cart"}
                </span>
              ) : (
                <span>{isComingSoon ? "Pre-ordering..." : "Adding..."}</span>
              )}
            </button>
          </div>

          {/* Content Section */}
          <div className="flex flex-col h-auto md:h-full">
            {/* Info Section */}
            <div className="p-4 flex flex-col h-auto md:h-full">
              {/* Price and Stock */}
              <div className="flex flex-col mb-2">
                <div className="flex flex-wrap items-baseline justify-between w-full gap-x-2">
                  <div className="flex flex-col items-baseline gap-1">
                    {product.discount ? (
                      <>
                        <h5 className="whitespace-nowrap">
                          $
                          {(
                            currentPrice *
                            (1 - product.discount / 100)
                          ).toFixed(2)}{" "}
                          CAD
                        </h5>
                        <div className="flex items-center gap-1">
                          <h6 className=" line-through text-muted-foreground">
                            ${currentPrice?.toFixed(2)}
                          </h6>
                          <Badge variant="green">{product.discount}% OFF</Badge>
                        </div>
                      </>
                    ) : (
                      <h5 className="whitespace-nowrap">
                        ${currentPrice?.toFixed(2)} CAD
                      </h5>
                    )}
                  </div>

                  {!product.unlimitedStock && (
                    <div className="mt-1 text-xs">
                      {getEffectiveStock > 0 ? (
                        <Badge variant="outline">
                          <span className="text-muted-foreground">
                            In stock:{" "}
                          </span>
                          <span>{getEffectiveStock}</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          Out of stock
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {isComingSoon && (
                  <>
                    <span className="text-sm hidden sm:inline">
                      Coming Soon
                    </span>
                    <span className="text-sm w-full block sm:hidden mt-1">
                      Coming Soon
                    </span>
                  </>
                )}
              </div>

              {/* Product Name */}
              <p className=" mb-3">{product.name}</p>

              {/* Variations */}
              {product.hasVariations &&
                product.variations &&
                product.variations.length > 0 && (
                  <div ref={variationsRef} className="space-y-2">
                    {attributeNames.map((attributeId: string) => (
                      <FilterGroup
                        key={attributeId}
                        title={getAttributeDisplayName(attributeId)}
                        options={getUniqueAttributeValues(attributeId)}
                        selectedOptions={
                          selectedAttributes[attributeId] || null
                        }
                        onOptionChange={(value) => {
                          if (value) {
                            selectVariation(attributeId, value);
                          }
                        }}
                        showAllOption={false}
                        variant="product"
                        getOptionAvailability={(value) =>
                          isAttributeValueAvailable(attributeId, value)
                        }
                      />
                    ))}
                  </div>
                )}
            </div>

            {/* Mobile Add to Cart button */}
            <div className="md:hidden mt-auto">
              <button
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center space-x-2 bg-muted backdrop-blur-xs text-black hover:bg-black  transition-all duration-500 py-2 px-4 ${
                  !isAvailable
                    ? "opacity-50 cursor-not-allowed hover:bg-muted/70 hover:text-black"
                    : "hover:text-white"
                }`}
                disabled={!isAvailable}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 33 30"
                  className="cart-icon"
                >
                  <path
                    d="M1.94531 1.80127H7.27113L11.9244 18.602C12.2844 19.9016 13.4671 20.8013 14.8156 20.8013H25.6376C26.9423 20.8013 28.0974 19.958 28.495 18.7154L31.9453 7.9303H19.0041"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="13.4453"
                    cy="27.3013"
                    r="2.5"
                    fill="currentColor"
                  />
                  <circle
                    cx="26.4453"
                    cy="27.3013"
                    r="2.5"
                    fill="currentColor"
                  />
                </svg>
                {!isAddingToCart ? (
                  <span>
                    {!isAvailable
                      ? "Out of Stock"
                      : isComingSoon
                        ? "Pre-order"
                        : "Add to Cart"}
                  </span>
                ) : (
                  <span>{isComingSoon ? "Pre-ordering..." : "Adding..."}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
