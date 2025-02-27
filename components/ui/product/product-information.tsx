"use client";

import { Product, ProductVariation, VariationAttribute } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Extended product interface with category, brand, and variations information
interface ProductWithDetails extends Product {
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  brand?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  variations?: ProductVariationWithAttributes[];
}

interface ProductVariationWithAttributes extends ProductVariation {
  attributes: VariationAttribute[];
}

function ProductInformation({ product }: { product: ProductWithDetails }) {
  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariationWithAttributes | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  // Handle quantity changes
  const incrementQuantity = () => {
    const maxStock = selectedVariation
      ? selectedVariation.stock
      : product?.stock || 0;
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Get unique attribute names from all variations
  const getUniqueAttributeNames = (): string[] => {
    if (!product?.variations) return [];

    const attributeNames = new Set<string>();
    product.variations.forEach((variation) => {
      variation.attributes.forEach((attr) => {
        attributeNames.add(attr.name);
      });
    });

    return Array.from(attributeNames);
  };

  // Get unique attribute values for a specific attribute name
  const getUniqueAttributeValues = (attributeName: string): string[] => {
    if (!product?.variations) return [];

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

  // Find a variation that matches all the selected attributes
  const findMatchingVariation = (attributes: Record<string, string>) => {
    if (!product?.variations) return null;

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
    if (!product?.variations) return null;

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

  // Select a variation based on attribute name and value
  const selectVariation = (attributeName: string, attributeValue: string) => {
    if (!product?.variations) return;

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

  // Check if a specific attribute value is available with current selections
  const isAttributeValueAvailable = (
    attributeName: string,
    attributeValue: string
  ): boolean => {
    if (!product?.variations) return false;

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

  // Get attribute display names
  const getAttributeDisplayName = (name: string): string => {
    const attributeLabels: Record<string, string> = {
      apparel_type: "Apparel Type",
      size: "Size cm",
      apparel_size: "Size",
      color: "Color",
      volume: "Volume g",
    };

    return (
      attributeLabels[name] || name.charAt(0).toUpperCase() + name.slice(1)
    );
  };

  // Computed values
  const currentPrice = selectedVariation
    ? selectedVariation.price
    : product?.price || 0;
  const currentStock = selectedVariation
    ? selectedVariation.stock
    : product?.stock || 0;
  const canAddToCart = product?.isActive && currentStock > 0;
  const attributeNames = getUniqueAttributeNames();

  return (
    <div className="w-full lg:w-2/5 xl:w-1/3 px-4 lg:px-0 lg:min-h-[calc(100vh-2rem)] lg:flex lg:items-center mt-4 lg:mt-0 mb-40 lg:mb-0">
      <div className="space-y-6 w-full">
        <h3 className="text-2xl font-bold">{product.name}</h3>

        {/* Price */}
        <div className="text-xl font-medium">
          ${currentPrice.toFixed(2)} CAD
          {product.hasVolume && product.volume && (
            <span className="text-gray-500 text-lg ml-1">
              /{product.volume}
            </span>
          )}
        </div>

        {/* Variation selection */}
        {product.hasVariations && attributeNames.length > 0 && (
          <div className="flex flex-wrap gap-8">
            {attributeNames.map((attributeName) => (
              <div key={attributeName} className="w-auto min-w-fit">
                <h4 className="text-lg font-medium mb-1">
                  {getAttributeDisplayName(attributeName)}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {getUniqueAttributeValues(attributeName).map((value) => {
                    const isAvailable = isAttributeValueAvailable(
                      attributeName,
                      value
                    );
                    const isSelected =
                      selectedAttributes[attributeName] === value;

                    return (
                      <button
                        key={value}
                        onClick={() => selectVariation(attributeName, value)}
                        className={`
                                  px-4 py-2 border rounded-md transition-colors duration-200
                                  ${
                                    isSelected
                                      ? "bg-black text-white"
                                      : isAvailable
                                        ? "bg-white text-black"
                                        : "bg-gray-200 text-gray-600"
                                  }
                                  ${isAvailable ? "" : "opacity-50"}
                                `}
                        title={
                          isAvailable
                            ? ""
                            : "This variation is currently unavailable"
                        }
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stock information */}
        <div className="text-sm">
          {currentStock > 0 ? (
            <p>In stock: {currentStock}</p>
          ) : (
            <p className="text-red-600">Out of stock</p>
          )}
        </div>

        {/* Quantity selector and Add to cart */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={decrementQuantity}
              className={`w-10 h-10 rounded-full hover:bg-gray-100 transition flex items-center justify-center ${
                quantity <= 1 || !canAddToCart
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={quantity <= 1 || !canAddToCart}
            >
              <span className="text-2xl">-</span>
            </button>
            <span className="text-xl font-medium">{quantity}</span>
            <button
              onClick={incrementQuantity}
              className={`w-10 h-10 rounded-full hover:bg-gray-100 transition flex items-center justify-center ${
                !canAddToCart || quantity >= currentStock
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={!canAddToCart || quantity >= currentStock}
            >
              <span className="text-2xl">+</span>
            </button>
          </div>

          <Button
            size="lg"
            disabled={!canAddToCart}
            onClick={() => canAddToCart && alert("Added to cart")}
          >
            {canAddToCart ? (
              <>
                Add to Cart <span className="opacity-75">CAD</span> $
                {(currentPrice * quantity).toFixed(2)}
              </>
            ) : (
              "Out of Stock"
            )}
          </Button>
        </div>

        {/* Description */}
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-2">Description</h4>
          <div className="prose prose-sm">
            {product.description || "No description available."}
          </div>
        </div>

        {/* Category and Brand */}
        {(product.categoryId || product.brandId) && (
          <div className="border-t pt-4 mt-4">
            {product.category && (
              <div className="mb-2">
                <span className="text-gray-500">Category:</span>{" "}
                {product.category.name}
              </div>
            )}
            {product.brand && (
              <div>
                <span className="text-gray-500">Brand:</span>{" "}
                {product.brand.name}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductInformation;
