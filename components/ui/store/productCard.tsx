"use client";

import { Product, ProductVariation, VariationAttribute } from "@/types";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import styles from "./productCard.module.css";
import { useCart } from "@/lib/context/CartContext";
import { useCallback, useRef } from "react";
import { getAttributeDisplayName } from "@/lib/utils/productAttributes";

// Extended product interface with variations
interface ProductWithVariations extends Product {
  variations?: ProductVariationWithAttributes[];
}

interface ProductVariationWithAttributes extends ProductVariation {
  attributes: VariationAttribute[];
}

function ProductCard({ product }: { product: ProductWithVariations }) {
  const [isHovering, setIsHovering] = useState(false);
  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariationWithAttributes | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const { addProductToCart, cart } = useCart();

  // Ref for debouncing hover state
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  // Convert comma-separated string to array, or empty array if null
  const imageArray = useMemo(
    () => product.images?.split(",").map((img) => img.trim()) ?? [],
    [product.images]
  );

  // Initialize selected variation when product loads
  useEffect(() => {
    if (
      product.hasVariations &&
      product.variations &&
      product.variations.length > 0
    ) {
      // Sort variations by sort property (descending order)
      const sortedVariations = [...product.variations].sort(
        (a, b) => (b.sort ?? 0) - (a.sort ?? 0)
      );
      // Select first available variation
      const firstVariation = sortedVariations[0];
      setSelectedVariation(firstVariation);

      // Initialize selected attributes from the first variation
      const initialAttributes: Record<string, string> = {};
      firstVariation.attributes.forEach((attr: VariationAttribute) => {
        initialAttributes[attr.attributeId] = attr.value;
      });
      setSelectedAttributes(initialAttributes);
    }

    // Initialize image loading state
    setImagesLoaded(new Array(imageArray.length).fill(false));
  }, [product, imageArray.length]);

  // Handle image load events with useCallback
  const handleImageLoad = useCallback((index: number) => {
    setImagesLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  }, []);

  // Get unique attribute names from all variations
  const getUniqueAttributeNames = useMemo((): string[] => {
    if (!product.variations) return [];

    const attributeNames = new Set<string>();
    product.variations.forEach((variation) => {
      variation.attributes.forEach((attr: VariationAttribute) => {
        attributeNames.add(attr.attributeId);
      });
    });

    return Array.from(attributeNames);
  }, [product.variations]);

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

  // Find a variation that matches all the selected attributes
  const findMatchingVariation = useCallback(
    (attributes: Record<string, string>) => {
      if (!product.variations) return null;

      return (
        product.variations.find((variation) => {
          return Object.entries(attributes).every(([attributeId, value]) =>
            variation.attributes.some(
              (attr) => attr.attributeId === attributeId && attr.value === value
            )
          );
        }) || null
      );
    },
    [product.variations]
  );

  // Find the best combination of attributes that includes the selected attribute
  const findBestAttributeCombination = useCallback(
    (
      attributeId: string,
      attributeValue: string
    ): Record<string, string> | null => {
      if (!product.variations) return null;

      // Find variations that match the selected attribute
      const matchingVariations = product.variations.filter((variation) =>
        variation.attributes.some(
          (attr) =>
            attr.attributeId === attributeId && attr.value === attributeValue
        )
      );

      if (matchingVariations.length === 0) return null;

      // Use the first matching variation's attributes
      const bestVariation = matchingVariations[0];
      const bestAttributes: Record<string, string> = {};

      bestVariation.attributes.forEach((attr) => {
        bestAttributes[attr.attributeId] = attr.value;
      });

      return bestAttributes;
    },
    [product.variations]
  );

  // Select a variation based on attribute ID and value
  const selectVariation = useCallback(
    (attributeId: string, attributeValue: string) => {
      if (!product.variations) return;

      // Update selected attributes
      const newSelectedAttributes = {
        ...selectedAttributes,
        [attributeId]: attributeValue,
      };

      // First, try to find a variation that matches all selected attributes
      let newVariation = findMatchingVariation(newSelectedAttributes);

      // If no matching variation found, adjust other attributes to find a valid combination
      if (!newVariation) {
        // Keep the current attribute selection and find the best matching variation
        const bestAttributes = findBestAttributeCombination(
          attributeId,
          attributeValue
        );

        if (bestAttributes) {
          newVariation = findMatchingVariation(bestAttributes);
          if (newVariation) {
            setSelectedAttributes(bestAttributes);
          }
        }
      } else {
        setSelectedAttributes(newSelectedAttributes);
      }

      if (newVariation) {
        setSelectedVariation(newVariation);
      }
    },
    [
      product.variations,
      selectedAttributes,
      findMatchingVariation,
      findBestAttributeCombination,
    ]
  );

  // Check if a specific attribute value is available with current selections
  const isAttributeValueAvailable = useCallback(
    (attributeId: string, attributeValue: string): boolean => {
      if (!product.variations) return false;

      // Get all other selected attributes except the one we're checking
      const otherAttributes = { ...selectedAttributes };
      delete otherAttributes[attributeId];

      // Check if there's any variation that matches this attribute value and all other selected attributes
      return product.variations.some((variation) => {
        const matchesThisAttribute = variation.attributes.some(
          (attr) =>
            attr.attributeId === attributeId && attr.value === attributeValue
        );

        const matchesOtherAttributes = Object.entries(otherAttributes).every(
          ([id, value]) =>
            variation.attributes.some(
              (attr) => attr.attributeId === id && attr.value === value
            )
        );

        return matchesThisAttribute && matchesOtherAttributes;
      });
    },
    [product.variations, selectedAttributes]
  );

  // Calculate effective stock by subtracting cart quantities
  const getEffectiveStock = useMemo(() => {
    if (!product.unlimitedStock) {
      // For weight-based products with variations
      if (product.weight && selectedVariation) {
        const weightAttr = selectedVariation.attributes.find(
          (attr) => attr.attributeId === "WEIGHT_G"
        );

        if (weightAttr) {
          const totalWeight = parseInt(product.weight);
          const variationWeight = parseInt(weightAttr.value);

          // Calculate total weight used by all variations in cart
          const weightUsedInCart = cart.items
            .filter((item) => item.productId === product.id)
            .reduce((total, item) => {
              // Find the weight of this cart item's variation
              const cartItemWeight = item.attributes?.["WEIGHT_G"];
              if (cartItemWeight) {
                return total + parseInt(cartItemWeight) * item.quantity;
              }
              return total;
            }, 0);

          // Calculate remaining weight
          const remainingWeight = Math.max(0, totalWeight - weightUsedInCart);

          // Calculate how many packages of current variation can be made
          return Math.floor(remainingWeight / variationWeight);
        }
      }

      // For regular variations
      const dbStock = selectedVariation
        ? selectedVariation.stock
        : product.stock;

      // Find matching item in cart (if any)
      const cartItem = cart.items.find(
        (item) =>
          item.productId === product.id &&
          item.variationId === (selectedVariation?.id || undefined)
      );

      // Subtract cart quantity from database stock
      return cartItem ? Math.max(0, dbStock - cartItem.quantity) : dbStock;
    }

    return Infinity;
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

  return (
    <Link
      href={`/product/${product.slug}`}
      className="block h-full relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
                    onLoad={() => handleImageLoad(0)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
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
                    onLoad={() => handleImageLoad(1)}
                  />
                </div>
              )}
            </div>

            {/* Desktop Add to Cart button */}
            <button
              onClick={handleAddToCart}
              className={`absolute bottom-0 left-0 right-0 hidden md:flex items-center justify-center space-x-2 bg-gray-200/70 backdrop-blur-xs text-black hover:bg-black hover:text-white transition-all duration-500 py-2 opacity-0 group-hover:opacity-100 ${
                !isAvailable
                  ? "cursor-not-allowed hover:bg-gray-200/70 hover:text-black opacity-50"
                  : ""
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
                        <div className="flex items-baseline gap-1">
                          <h6 className=" line-through text-gray-500">
                            ${currentPrice?.toFixed(2)}
                          </h6>
                          <p className="ml-1 text-red-600">
                            {product.discount}% OFF
                          </p>
                        </div>
                      </>
                    ) : (
                      <h5 className="whitespace-nowrap">
                        ${currentPrice?.toFixed(2)} CAD
                      </h5>
                    )}
                  </div>

                  {!product.unlimitedStock && (
                    <div className="mt-1 text-xs text-gray-500">
                      {getEffectiveStock > 0 ? (
                        <span>In stock: {getEffectiveStock}</span>
                      ) : (
                        <span className="text-red-600">Out of stock</span>
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
                  <div className="space-y-2">
                    {attributeNames.map((attributeId: string) => (
                      <div key={attributeId}>
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          {getAttributeDisplayName(attributeId)}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {getUniqueAttributeValues(attributeId).map(
                            (value) => {
                              const isAvailable = isAttributeValueAvailable(
                                attributeId,
                                value
                              );
                              const isSelected =
                                selectedAttributes[attributeId] === value;

                              return (
                                <button
                                  key={value}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    selectVariation(attributeId, value);
                                  }}
                                  className={`
                                px-2 py-1 text-xs rounded-full border transition-colors duration-200
                                ${
                                  isSelected
                                    ? "border-black bg-black text-white"
                                    : isAvailable
                                      ? "border-gray-300 hover:border-black"
                                      : "border-gray-200 text-gray-400"
                                }
                                ${isAvailable ? "" : "opacity-50"}
                              `}
                                  title={
                                    !isAvailable
                                      ? "This combination is not available"
                                      : ""
                                  }
                                >
                                  {value}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Mobile Add to Cart button */}
            <div className="md:hidden mt-auto">
              <button
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center space-x-2 bg-gray-200/70 backdrop-blur-xs text-black hover:bg-black hover:text-white transition-all duration-500 py-2 px-4 ${
                  !isAvailable
                    ? "opacity-50 cursor-not-allowed hover:bg-gray-200/70 hover:text-black"
                    : ""
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
