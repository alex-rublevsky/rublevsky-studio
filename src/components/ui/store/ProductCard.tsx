import { Product, ProductVariation, VariationAttribute } from "~/types";
import { Link } from "@tanstack/react-router";

import { useState, useMemo, memo } from "react";
import { Image } from "~/components/ui/shared/Image";
import styles from "./productCard.module.css";
import { useCart } from "~/lib/cartContext";
import { useCallback, useRef } from "react";
import { getAttributeDisplayName } from "~/lib/productAttributes";
import { Badge } from "../shared/Badge";
import { FilterGroup } from "../shared/FilterGroup";
import {
  getAvailableQuantityForVariation,
  isProductAvailable,
} from "~/utils/validateStock";
import { useVariationSelection } from "~/hooks/useVariationSelection";
import { cn } from "~/lib/utils";
import { useCursorHover } from "../shared/custom_cursor/CustomCursorContext";
import {unstable_ViewTransition as ViewTransition} from 'react';

// Extended product interface with variations
interface ProductWithVariations extends Product {
  variations?: ProductVariationWithAttributes[];
  stockDisplay?: {
    label: string;
    showValues: boolean;
    countries: {
      countryCode: string;
      stock: number;
      emoji: string;
      displayValue: string | null;
    }[];
  };
}

interface ProductVariationWithAttributes extends ProductVariation {
  attributes: VariationAttribute[];
}

// Memoize expensive calculations outside component
const calculateImageArray = (images: string | null): string[] => {
  return images?.split(",").map((img) => img.trim()) ?? [];
};

const calculateUniqueAttributeValues = (
  variations: ProductVariationWithAttributes[] | undefined,
  attributeId: string
): string[] => {
  if (!variations) return [];

  const sortedVariations = [...variations].sort(
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
};

const calculateAttributeNames = (
  variations: ProductVariationWithAttributes[] | undefined
): string[] => {
  if (!variations) return [];

  const attributeNames = new Set<string>();
  variations.forEach((variation) => {
    variation.attributes.forEach((attr: VariationAttribute) => {
      attributeNames.add(attr.attributeId);
    });
  });

  return Array.from(attributeNames);
};

const ProductCard = memo(function ProductCard({
  product,
}: {
  product: ProductWithVariations;
}) {
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

  // Memoize expensive calculations
  const imageArray = useMemo(
    () => calculateImageArray(product.images),
    [product.images]
  );

  // Get unique attribute values for a specific attribute ID - memoized
  const getUniqueAttributeValues = useCallback(
    (attributeId: string): string[] => {
      return calculateUniqueAttributeValues(product.variations, attributeId);
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

  // Custom cursor hover for Add to Cart button
  const { handleMouseEnter: handleAddToCartMouseEnter, handleMouseLeave: handleAddToCartMouseLeave } = useCursorHover(
    "add",
    !isAvailable // Disable cursor when product is not available
  );

  // Check if ANY variation has stock (for image graying out)
  const hasAnyStock = useMemo(() => {
    return isProductAvailable(product, cart.items);
  }, [product, cart.items]);

  // Calculate current price based on selected variation
  const currentPrice = useMemo(() => {
    // If product has variations, always use variation price
    if (product.hasVariations) {
      return selectedVariation?.price || 0;
    }
    // If product price is zero, use variation price (if available)
    if (product.price === 0 && selectedVariation) {
      return selectedVariation.price;
    }
    return selectedVariation ? selectedVariation.price : product.price;
  }, [selectedVariation, product.price, product.hasVariations]);

  // Get attribute names to display in the card - memoized
  const attributeNames = useMemo(
    () => calculateAttributeNames(product.variations),
    [product.variations]
  );

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

  // Simple hover handlers - only work on desktop
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



    return (
    <Link
      to="/store/$productId"
      params={{
        productId: product.slug,
      }}
      className="block h-full relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="w-full product-card overflow-hidden  group"
        id={styles.productCard}
      >
        <div className="bg-background flex flex-col">
          <div className="relative aspect-square overflow-hidden">
            <div>
              {/* Primary Image */}
              <div className="relative aspect-square flex items-center justify-center overflow-hidden">
                {imageArray.length > 0 ? (
                  <ViewTransition name={`product-image-${product.slug}`}>
                    <div className="relative w-full h-full">
                      <Image
                        src={`/${imageArray[0]}`}
                        alt={product.name}
                        //fill
                        className={cn(
                          "absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ease-in-out",
                          !hasAnyStock && "grayscale opacity-60"
                        )}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {/* Secondary Image (if exists) - Only on desktop devices with hover capability */}
                      {imageArray.length > 1 && (
                        <Image
                          src={`/${imageArray[1]}`}
                          alt={product.name}
                          //fill
                          className={cn(
                            "absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-in-out hidden md:block",
                            isHovering ? "opacity-100" : "opacity-0",
                            !hasAnyStock && "grayscale"
                          )}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      )}
                    </div>
                  </ViewTransition>
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Add to Cart button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(e);
              }}
              onMouseEnter={handleAddToCartMouseEnter()}
              onMouseLeave={handleAddToCartMouseLeave()}
              className={`absolute bottom-0 left-0 right-0 hidden md:flex items-center justify-center space-x-2 bg-muted/70 backdrop-blur-xs text-black hover:bg-black  transition-all duration-500 py-2 opacity-0 group-hover:opacity-100 ${
                !isAvailable
                  ? "cursor-not-allowed hover:bg-muted/70 opacity-50"
                  : "cursor-none hover:text-white"
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
                <div className="flex flex-wrap items-center justify-between w-full gap-x-2">
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

                  {product.stockDisplay && product.stockDisplay.countries.length > 0 && (
                    <div className="flex flex-col items-end text-xs">
                      <span className="text-muted-foreground mb-0">
                        {product.stockDisplay.label}
                      </span>
                      <div className="flex items-center gap-2 text-sm">
                        {product.stockDisplay.countries.map((country) => (
                          <span key={country.countryCode} className="flex items-center">
                            <span className="text-lg">{country.emoji}</span>
                            {country.displayValue && (
                              <span className="ml-1 font-medium">{country.displayValue}</span>
                            )}
                          </span>
                        ))}
                      </div>
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
                  <div className="space-y-2">
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
                              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(e);
              }}
                className={`w-full cursor-pointer flex items-center justify-center space-x-2 bg-muted backdrop-blur-xs text-black hover:bg-black  transition-all duration-500 py-2 px-4 ${
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
});

export default ProductCard;
