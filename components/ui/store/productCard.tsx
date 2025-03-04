"use client";

import { Product, ProductVariation, VariationAttribute } from "@/types";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./productCard.module.css";

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

  // Convert comma-separated string to array, or empty array if null
  const imageArray = product.images?.split(",").map((img) => img.trim()) ?? [];

  // Initialize selected variation when product loads
  useEffect(() => {
    if (
      product.hasVariations &&
      product.variations &&
      product.variations.length > 0
    ) {
      // Select first available variation
      const firstVariation = product.variations[0];
      setSelectedVariation(firstVariation);

      // Initialize selected attributes from the first variation
      const initialAttributes: Record<string, string> = {};
      firstVariation.attributes.forEach((attr: VariationAttribute) => {
        initialAttributes[attr.name] = attr.value;
      });
      setSelectedAttributes(initialAttributes);
    }

    // Initialize image loading state
    setImagesLoaded(new Array(imageArray.length).fill(false));
  }, [product]);

  // Handle image load events
  const handleImageLoad = (index: number) => {
    setImagesLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  // Get unique attribute names from all variations
  const getUniqueAttributeNames = (): string[] => {
    if (!product.variations) return [];

    const attributeNames = new Set<string>();
    product.variations.forEach((variation) => {
      variation.attributes.forEach((attr: VariationAttribute) => {
        attributeNames.add(attr.name);
      });
    });

    return Array.from(attributeNames).sort((a, b) => {
      // Sort attribute types: apparel_type first, then size, then others
      const order: Record<string, number> = {
        apparel_type: 1,
        size: 2,
        apparel_size: 3,
        color: 4,
      };
      return (order[a] || 99) - (order[b] || 99);
    });
  };

  // Get unique attribute values for a specific attribute name
  const getUniqueAttributeValues = (attributeName: string): string[] => {
    if (!product.variations) return [];

    const values = new Set<string>();
    product.variations.forEach((variation) => {
      const attribute = variation.attributes.find(
        (attr) => attr.name === attributeName
      );
      if (attribute) {
        values.add(attribute.value);
      }
    });

    return Array.from(values);
  };

  // Select a variation based on attribute name and value
  const selectVariation = (attributeName: string, attributeValue: string) => {
    if (!product.variations) return;

    // Update selected attributes
    const newSelectedAttributes = {
      ...selectedAttributes,
      [attributeName]: attributeValue,
    };

    // First, try to find a variation that matches all selected attributes
    let newVariation = findMatchingVariation(newSelectedAttributes);

    // If no matching variation found, adjust other attributes to find a valid combination
    if (!newVariation) {
      // Keep the current attribute selection and find the best matching variation
      const bestAttributes = findBestAttributeCombination(
        attributeName,
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
  };

  // Find a variation that matches all the selected attributes
  const findMatchingVariation = (attributes: Record<string, string>) => {
    if (!product.variations) return null;

    return product.variations.find((variation) => {
      return Object.entries(attributes).every(([name, value]) =>
        variation.attributes.some(
          (attr) => attr.name === name && attr.value === value
        )
      );
    });
  };

  // Find the best combination of attributes that includes the selected attribute
  const findBestAttributeCombination = (
    attributeName: string,
    attributeValue: string
  ) => {
    if (!product.variations) return null;

    // Find variations that match the selected attribute
    const matchingVariations = product.variations.filter((variation) =>
      variation.attributes.some(
        (attr) => attr.name === attributeName && attr.value === attributeValue
      )
    );

    if (matchingVariations.length === 0) return null;

    // Use the first matching variation's attributes
    const bestVariation = matchingVariations[0];
    const bestAttributes: Record<string, string> = {};

    bestVariation.attributes.forEach((attr) => {
      bestAttributes[attr.name] = attr.value;
    });

    return bestAttributes;
  };

  // Check if a specific attribute value is available with current selections
  const isAttributeValueAvailable = (
    attributeName: string,
    attributeValue: string
  ): boolean => {
    if (!product.variations) return false;

    // Get all other selected attributes except the one we're checking
    const otherAttributes = { ...selectedAttributes };
    delete otherAttributes[attributeName];

    // Check if there's any variation that matches this attribute value and all other selected attributes
    return product.variations.some((variation) => {
      const matchesThisAttribute = variation.attributes.some(
        (attr) => attr.name === attributeName && attr.value === attributeValue
      );

      const matchesOtherAttributes = Object.entries(otherAttributes).every(
        ([name, value]) =>
          variation.attributes.some(
            (attr) => attr.name === name && attr.value === value
          )
      );

      return matchesThisAttribute && matchesOtherAttributes;
    });
  };

  const getAvailableStock = () => {
    if (product.unlimitedStock) return Infinity;

    if (product.hasVariations && selectedVariation) {
      return selectedVariation.stock;
    }

    return product.stock;
  };

  const canAddToCart = () => {
    const stock = getAvailableStock();
    return product.isActive && stock > 0;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canAddToCart()) return;

    setIsAddingToCart(true);
    // Simulate adding to cart
    setTimeout(() => {
      console.log(`Adding product ${product.id} to cart`);
      if (selectedVariation) {
        console.log(`Selected variation: ${selectedVariation.id}`);
      }
      setIsAddingToCart(false);
    }, 1000);
  };

  const availableStock = getAvailableStock();
  const isAvailable = canAddToCart();
  const currentPrice = selectedVariation
    ? selectedVariation.price
    : product.price;

  // Check if product is coming soon (not in the type, so we'll use a placeholder)
  const isComingSoon = false; // Replace with actual logic when available

  // Get attribute names to display in the card
  const attributeNames = getUniqueAttributeNames();

  return (
    <div
      className="w-full product-card overflow-hidden rounded-lg group"
      id={styles.productCard}
    >
      <div className="bg-white flex flex-col">
        <div className="relative aspect-square overflow-hidden">
          <div>
            <Link
              href={`/product/${product.slug}`}
              className="block h-full relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
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
            </Link>
          </div>

          {/* Desktop Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-0 left-0 right-0 hidden md:flex items-center justify-center space-x-2 bg-gray-200/70 backdrop-blur-sm text-black hover:bg-black hover:text-white transition-all duration-500 py-2 opacity-0 group-hover:opacity-100 ${
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
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-light text-black whitespace-nowrap">
                    ${currentPrice?.toFixed(2)} CAD
                    {product.hasVolume && product.volume && (
                      <span className="text-black text-sm font-light">
                        /{product.volume}
                      </span>
                    )}
                  </span>
                </div>

                {!product.unlimitedStock && (
                  <span className="text-xs whitespace-nowrap">
                    {availableStock} in stock
                  </span>
                )}
              </div>

              {isComingSoon && (
                <>
                  <span className="text-sm hidden sm:inline">Coming Soon</span>
                  <span className="text-sm w-full block sm:hidden mt-1">
                    Coming Soon
                  </span>
                </>
              )}
            </div>

            {/* Product Name */}
            <h3 className="text-sm mb-3">{product.name}</h3>

            {/* Variations */}
            {product.hasVariations &&
              product.variations &&
              product.variations.length > 0 && (
                <div className="space-y-2">
                  {attributeNames.map((attributeName) => (
                    <div key={attributeName}>
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        {attributeName}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {getUniqueAttributeValues(attributeName).map(
                          (value) => {
                            const isAvailable = isAttributeValueAvailable(
                              attributeName,
                              value
                            );
                            const isSelected =
                              selectedAttributes[attributeName] === value;

                            return (
                              <button
                                key={value}
                                onClick={(e) => {
                                  e.preventDefault();
                                  selectVariation(attributeName, value);
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
              className={`w-full flex items-center justify-center space-x-2 bg-gray-200/70 backdrop-blur-sm text-black hover:bg-black hover:text-white transition-all duration-500 py-2 px-4 ${
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
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
