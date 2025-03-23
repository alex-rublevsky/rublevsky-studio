"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Product, ProductVariation, VariationAttribute } from "@/types";
import getProductBySlug from "@/lib/actions/products/getProductBySlug";
import Link from "next/link";
import { useCart } from "@/lib/context/CartContext";
import { toast } from "sonner";
import { QuantitySelector } from "@/components/ui/shared/QuantitySelector";
import { getAttributeDisplayName } from "@/lib/utils/productAttributes";
import ImageGallery from "@/components/ui/shared/ImageGallery";

// Extended product interface with category, brand, and variations information
interface ProductWithDetails extends Product {
  category?: {
    name: string;
    slug: string;
  } | null;
  brand?: {
    name: string;
    slug: string;
  } | null;
  variations?: ProductVariationWithAttributes[];
  blogPost?: {
    id: number;
    title: string;
    slug: string;
    body: string;
    blogUrl: string;
  } | null;
}

interface ProductVariationWithAttributes extends ProductVariation {
  attributes: VariationAttribute[];
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariationWithAttributes | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const { addProductToCart, cart } = useCart();

  // Fetch product data using the server action
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setError("Product not found");
        setLoading(false);
        return;
      }

      try {
        // Use the server action instead of the API
        const productData = await getProductBySlug(slug);

        if (!productData) {
          setError("Product not found");
          setLoading(false);
          return;
        }

        setProduct(productData);

        // Get first image from comma-separated string
        const imageArray =
          productData.images?.split(",").map((img) => img.trim()) ?? [];
        if (imageArray.length > 0) {
          setSelectedImage(imageArray[0]);
        }

        // If product has variations, select the first available one
        if (
          productData.hasVariations &&
          productData.variations &&
          productData.variations.length > 0
        ) {
          // Sort variations by sort property (descending order)
          const sortedVariations = [...productData.variations].sort(
            (a, b) => (b.sort ?? 0) - (a.sort ?? 0)
          );

          // Select first available variation
          const firstVariation = sortedVariations[0];
          setSelectedVariation(firstVariation);

          // Initialize selected attributes from the first variation
          const initialAttributes: Record<string, string> = {};
          firstVariation.attributes.forEach((attribute: VariationAttribute) => {
            initialAttributes[attribute.attributeId] = attribute.value;
          });
          setSelectedAttributes(initialAttributes);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Calculate effective stock by subtracting cart quantities
  const getEffectiveStock = useMemo(() => {
    if (!product) return 0;

    if (product.unlimitedStock) return Infinity;

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
    const dbStock = selectedVariation ? selectedVariation.stock : product.stock;

    // Find matching item in cart (if any)
    const cartItem = cart.items.find(
      (item) =>
        item.productId === product.id &&
        item.variationId === (selectedVariation?.id || undefined)
    );

    // Subtract cart quantity from database stock
    return cartItem ? Math.max(0, dbStock - cartItem.quantity) : dbStock;
  }, [product, selectedVariation, cart.items]);

  // Handle quantity changes
  const incrementQuantity = useCallback(() => {
    if (product?.unlimitedStock || quantity < getEffectiveStock) {
      setQuantity((prev) => prev + 1);
    }
  }, [quantity, getEffectiveStock, product?.unlimitedStock]);

  const decrementQuantity = useCallback(() => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  }, [quantity]);

  // Get images array from product
  const getImages = (): string[] => {
    if (!product || !product.images) return [];
    return product.images.split(",").map((img) => img.trim());
  };

  // Get unique attribute names from all variations
  const getUniqueAttributeNames = (): string[] => {
    if (!product?.variations) return [];

    const attributeNames = new Set<string>();
    product.variations.forEach((variation) => {
      variation.attributes.forEach((attr) => {
        attributeNames.add(attr.attributeId);
      });
    });

    return Array.from(attributeNames);
  };

  // Get unique attribute values for a specific attribute ID
  const getUniqueAttributeValues = useCallback(
    (attributeId: string): string[] => {
      if (!product?.variations) return [];

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
    [product?.variations]
  );

  // Select a variation based on attribute ID and value
  const selectVariation = (attributeId: string, attributeValue: string) => {
    if (!product?.variations) return;

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
      // Reset quantity to 1 when variation changes
      setQuantity(1);
    }
  };

  // Find a variation that matches all the selected attributes
  const findMatchingVariation = (attributes: Record<string, string>) => {
    if (!product?.variations) return null;

    return product.variations.find((variation) => {
      return Object.entries(attributes).every(([attributeId, value]) =>
        variation.attributes.some(
          (attr) => attr.attributeId === attributeId && attr.value === value
        )
      );
    });
  };

  // Find the best combination of attributes that includes the selected attribute
  const findBestAttributeCombination = (
    attributeId: string,
    attributeValue: string
  ) => {
    if (!product?.variations) return null;

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
  };

  // Check if a specific attribute value is available with current selections
  const isAttributeValueAvailable = (
    attributeId: string,
    attributeValue: string
  ): boolean => {
    if (!product?.variations) return false;

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
  };

  const images = getImages();
  const currentPrice = selectedVariation
    ? selectedVariation.price
    : product?.price || 0;

  // Use the effective stock instead of just the database stock
  const effectiveStock = getEffectiveStock;
  const canAddToCart = product?.isActive && effectiveStock > 0;
  const attributeNames = getUniqueAttributeNames();

  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    const success = await addProductToCart(
      product,
      quantity,
      selectedVariation,
      selectedAttributes
    );

    if (success) {
      // Reset quantity to 1 after successful add
      setQuantity(1);
    }
  }, [
    product,
    addProductToCart,
    quantity,
    selectedVariation,
    selectedAttributes,
  ]);

  // Memoize the Image component to prevent unnecessary re-renders
  const memoizedImage = useMemo(() => {
    if (!product || !selectedImage) return null;

    return (
      <Image
        src={`/${selectedImage}`}
        alt={`${product.name} main image`}
        width={3000}
        height={3000}
        priority
        className="max-w-full w-full lg:w-auto max-h-[calc(100vh-5rem)] object-contain rounded-none lg:rounded-lg relative z-2"
      />
    );
  }, [selectedImage, product?.name]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading product...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-lg">
            {error || "The requested product could not be found."}
          </p>
        </div>
      </main>
    );
  }

  const renderBlogPostLink = () => {
    if (product?.blogPost) {
      return (
        <div className="border-t pt-4 mt-4">
          <div className="mb-2">
            <span className="text-gray-500">Read more:</span>{" "}
            <Link
              href={product.blogPost.blogUrl}
              className="text-blue-600 hover:underline"
            >
              {product.blogPost.title}
            </Link>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen flex flex-col lg:h-screen lg:overflow-hidden">
      <div className="grow flex items-start justify-center">
        <div className="w-full h-full flex flex-col lg:flex-row gap-0 lg:gap-10 items-start lg:p-4">
          {/* Image gallery */}
          <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col lg:flex-row gap-2 lg:h-full self-start">
            {images.length > 0 && (
              <ImageGallery images={images} alt={product.name} />
            )}
          </div>

          {/* Product information */}
          <div className="w-full lg:w-2/5 xl:w-1/3 px-4 lg:px-0 lg:min-h-[calc(100vh-2rem)] lg:flex lg:items-center mt-4 lg:mt-0 mb-40 lg:mb-0">
            <div className="space-y-6 w-full">
              <h3>{product.name}</h3>

              {/* Price */}
              <div className="text-xl font-medium">
                {product.discount ? (
                  <div className="flex items-baseline gap-2">
                    <span className="line-through text-gray-500">
                      ${currentPrice.toFixed(2)}
                    </span>
                    <span>
                      $
                      {(currentPrice * (1 - product.discount / 100)).toFixed(2)}{" "}
                      CAD
                    </span>
                    <span className="text-sm text-red-600">
                      {product.discount}% OFF
                    </span>
                  </div>
                ) : (
                  <span>${currentPrice.toFixed(2)} CAD</span>
                )}
              </div>

              {/* Variation selection */}
              {product.hasVariations && attributeNames.length > 0 && (
                <div className="flex flex-wrap gap-8">
                  {attributeNames.map((attributeId) => (
                    <div key={attributeId} className="w-auto min-w-fit">
                      <h4 className="text-lg font-medium mb-1">
                        {getAttributeDisplayName(attributeId)}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {getUniqueAttributeValues(attributeId).map((value) => {
                          const isAvailable = isAttributeValueAvailable(
                            attributeId,
                            value
                          );
                          const isSelected =
                            selectedAttributes[attributeId] === value;

                          return (
                            <button
                              key={value}
                              onClick={() =>
                                selectVariation(attributeId, value)
                              }
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

              {/* Stock information - updated to hide for unlimited stock */}
              {!product.unlimitedStock && (
                <div className="text-sm">
                  {effectiveStock > 0 ? (
                    <p>In stock: {effectiveStock}</p>
                  ) : (
                    <p className="text-red-600">Out of stock</p>
                  )}
                </div>
              )}

              {/* Quantity selector and Add to cart */}
              <div className="flex flex-wrap items-center gap-4">
                <QuantitySelector
                  quantity={quantity}
                  onIncrement={incrementQuantity}
                  onDecrement={decrementQuantity}
                  minQuantity={1}
                  maxQuantity={
                    product.unlimitedStock ? undefined : effectiveStock
                  }
                  disabled={!canAddToCart}
                  size="default"
                />
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  disabled={!canAddToCart}
                >
                  {canAddToCart ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>

              {/* Product description */}
              <div className="prose max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: product.description || "",
                  }}
                />
              </div>

              {/* Metadata */}
              <div className="space-y-2 text-sm text-gray-600">
                {product.category && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Category:</span>
                    <Link href={`/store?category=${product.category.slug}`}>
                      {product.category.name}
                    </Link>
                  </div>
                )}
                {product.brand && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Brand:</span>
                    <Link href={`/store?brand=${product.brand.slug}`}>
                      {product.brand.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {renderBlogPostLink()}
    </main>
  );
}
