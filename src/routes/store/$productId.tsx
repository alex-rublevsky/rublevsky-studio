import { createFileRoute } from "@tanstack/react-router";
import ImageGallery from "~/components/ui/shared/ImageGallery";
import { useState, useEffect, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { Button } from "~/components/ui/shared/Button";
import { Link } from "@tanstack/react-router";
import { useCart } from "~/lib/cartContext";
import { QuantitySelector } from "~/components/ui/shared/QuantitySelector";
import {
  getAttributeDisplayName,
  PRODUCT_ATTRIBUTES,
} from "~/lib/productAttributes";
import { FilterGroup } from "~/components/ui/shared/FilterGroup";
import {
  ProductWithDetails,
  VariationAttribute,
  ProductWithVariations,
} from "~/types";
import { Badge } from "~/components/ui/shared/Badge";
import { getAvailableQuantityForVariation } from "~/utils/validateStock";
import { useVariationSelection } from "~/hooks/useVariationSelection";
import { useQuery } from "@tanstack/react-query";
import { DEPLOY_URL } from "~/utils/store";
import { z } from "zod";
import { ProductPageSkeleton } from "~/components/ui/store/skeletons/ProductPageSkeleton";
import { getCountryByCode } from "~/constants/countries";
import { useDeviceType } from "~/hooks/use-mobile";

// Create search params schema based on actual product attributes
const createProductSearchSchema = () => {
  const schemaObject: Record<string, z.ZodOptional<z.ZodString>> = {};

  // Add all known product attributes as optional string fields
  Object.keys(PRODUCT_ATTRIBUTES).forEach((attributeId) => {
    // Convert attribute IDs to lowercase for URL params (e.g., SIZE_CM -> size_cm)
    const paramName = attributeId.toLowerCase();
    schemaObject[paramName] = z.string().optional();
  });

  return z.object(schemaObject);
};

const productSearchSchema = createProductSearchSchema();

export const Route = createFileRoute("/store/$productId")({
  component: ProductPage,
  validateSearch: productSearchSchema,
  loader: async ({ params }) => {
    // Fetch product data in the loader for immediate availability
    const response = await fetch(`${DEPLOY_URL}/api/store/${params.productId}`);
    if (!response.ok) {
      throw new Error(`Product not found: ${response.status}`);
    }
    const product = await response.json();
    return { product };
  },
  // Removed pendingComponent to allow view transitions to work
  errorComponent: ({ error }) => <div>Error: {error.message}</div>,
});

function ProductPage() {
  const { product: loaderProduct } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [quantity, setQuantity] = useState(1);
  // Use loader data directly - cast to proper type
  const product = loaderProduct as ProductWithDetails;
  const { addProductToCart, cart, products } = useCart();
  const isMobileOrTablet = useDeviceType().isMobileOrTablet;

  // Disable body scroll on desktop, enable on mobile
  useEffect(() => {
    if (!isMobileOrTablet) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOrTablet]);

  // Sync product data with cart context for stock info
  const syncedProduct = useMemo(() => {
    if (!product) return product;

    // Find the product in the cart context cache
    const cachedProduct = products.find((p) => p.id === product.id);
    if (cachedProduct) {
      // Merge loader data with cached stock info
      return {
        ...product,
        stock: cachedProduct.stock,
        unlimitedStock: cachedProduct.unlimitedStock,
        variations: cachedProduct.variations,
      };
    }
    return product;
  }, [product, products]);

  // Variation selection hook using URL search params
  const {
    selectedVariation,
    selectedAttributes,
    selectVariation,
    isAttributeValueAvailable,
  } = useVariationSelection({
    product: syncedProduct as ProductWithVariations | null,
    cartItems: cart.items,
    search,
    onVariationChange: () => setQuantity(1), // Reset quantity when variation changes
  });

  // Find variation for pricing (regardless of stock status)
  const variationForPricing = useMemo(() => {
    if (!syncedProduct?.hasVariations || !syncedProduct.variations || !selectedAttributes) {
      return null;
    }

    // Find variation that matches all selected attributes, regardless of stock
    return (
      syncedProduct.variations.find((variation) => {
        return Object.entries(selectedAttributes).every(([attrId, value]) =>
          variation.attributes.some(
            (attr: VariationAttribute) =>
              attr.attributeId === attrId && attr.value === value
          )
        );
      }) || null
    );
  }, [syncedProduct, selectedAttributes]);

  // Calculate current price based on selected variation
  const currentPrice = useMemo(() => {
    // If product has variations, always use variation price
    if (syncedProduct?.hasVariations) {
      // Use selectedVariation for available stock, or variationForPricing for out-of-stock items
      const relevantVariation = selectedVariation || variationForPricing;
      return relevantVariation?.price || 0;
    }
    // If product price is zero, use variation price (if available)
    if (syncedProduct?.price === 0 && (selectedVariation || variationForPricing)) {
      const relevantVariation = selectedVariation || variationForPricing;
      return relevantVariation?.price || 0;
    }
    return syncedProduct?.price || 0;
  }, [
    selectedVariation,
    variationForPricing,
    syncedProduct?.price,
    syncedProduct?.hasVariations,
  ]);

  // Calculate current discount based on selected variation
  const currentDiscount = useMemo(() => {
    // Use selectedVariation for available stock, or variationForPricing for out-of-stock items
    const relevantVariation = selectedVariation || variationForPricing;
    if (relevantVariation && relevantVariation.discount) {
      return relevantVariation.discount;
    }
    return syncedProduct?.discount || null;
  }, [selectedVariation, variationForPricing, syncedProduct?.discount]);

  // Calculate current shipping location based on variation/product hierarchy
  const currentShippingFrom = useMemo(() => {
    // Priority 1: Selected variation's shipping location
    const relevantVariation = selectedVariation || variationForPricing;
    if (relevantVariation && relevantVariation.shippingFrom && relevantVariation.shippingFrom !== '' && relevantVariation.shippingFrom !== 'NONE') {
      return relevantVariation.shippingFrom;
    }
    // Priority 2: Product's shipping location
    return (syncedProduct?.shippingFrom && syncedProduct?.shippingFrom !== '' && syncedProduct?.shippingFrom !== 'NONE') ? syncedProduct?.shippingFrom : null;
  }, [selectedVariation, variationForPricing, syncedProduct?.shippingFrom]);

  // Calculate effective stock based on selected variation
  const effectiveStock = useMemo(() => {
    if (!syncedProduct) return 0;

    if (syncedProduct.unlimitedStock) {
      return Number.MAX_SAFE_INTEGER;
    }

    return getAvailableQuantityForVariation(
      syncedProduct as ProductWithVariations,
      selectedVariation?.id,
      cart.items
    );
  }, [syncedProduct, selectedVariation, cart.items]);

  // Check if product can be added to cart
  const canAddToCart = useMemo(() => {
    if (!syncedProduct?.isActive) return false;
    if (syncedProduct.hasVariations && !selectedVariation) return false;
    if (!syncedProduct.unlimitedStock && effectiveStock <= 0) return false;
    return true;
  }, [syncedProduct, selectedVariation, effectiveStock]);

  // Define all callbacks before any conditional returns
  const incrementQuantity = useCallback(() => {
    if (syncedProduct?.unlimitedStock || quantity < effectiveStock) {
      setQuantity((prev) => prev + 1);
    }
  }, [quantity, effectiveStock, syncedProduct?.unlimitedStock]);

  const decrementQuantity = useCallback(() => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  }, [quantity]);

  const getUniqueAttributeValues = useCallback(
    (attributeId: string): string[] => {
      if (!syncedProduct?.variations) return [];

      const sortedVariations = [...syncedProduct.variations].sort(
        (a, b) => (b.sort ?? 0) - (a.sort ?? 0)
      );

      const values = new Set<string>();
      sortedVariations.forEach((variation) => {
        const attribute = variation.attributes.find(
          (attr: VariationAttribute) => attr.attributeId === attributeId
        );
        if (attribute) {
          values.add(attribute.value);
        }
      });

      return Array.from(values);
    },
    [syncedProduct?.variations]
  );

  // Handle add to cart
  const handleAddToCart = useCallback(async () => {
    if (!syncedProduct || !canAddToCart) return;

    const success = await addProductToCart(
      syncedProduct,
      quantity,
      selectedVariation,
      selectedAttributes
    );

    if (success) {
      setQuantity(1); // Reset quantity after successful add
    }
  }, [
    syncedProduct,
    quantity,
    selectedVariation,
    selectedAttributes,
    canAddToCart,
    addProductToCart,
  ]);

  // Helper functions that don't need to be memoized
  const getImages = (): string[] => {
    if (!syncedProduct || !syncedProduct.images) return [];
    return syncedProduct.images.split(",").map((img: string) => img.trim());
  };

  const getUniqueAttributeNames = (): string[] => {
    if (!syncedProduct?.variations) return [];

    const attributeNames = new Set<string>();
    syncedProduct.variations.forEach((variation) => {
      variation.attributes.forEach((attr: VariationAttribute) => {
        attributeNames.add(attr.attributeId);
      });
    });

    return Array.from(attributeNames);
  };

  const attributeNames = getUniqueAttributeNames();

  // Add markdown components configuration
  const markdownComponents: Components = {
    a: ({ href, children, ...props }) => {
      if (href?.startsWith("/")) {
        // Internal link
        return (
          <Link to={href} className="text-primary hover:underline" {...props}>
            {children}
          </Link>
        );
      }
      // External link
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <main className="min-h-screen flex flex-col lg:h-screen lg:overflow-hidden">
      <div className="grow flex items-start justify-center">
        <div className="w-full h-full flex flex-col lg:flex-row gap-0 lg:gap-10 items-start">
          {/* Image gallery with view transitions */}
          <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col lg:flex-row gap-2 lg:h-full self-start">
            <ImageGallery
              images={syncedProduct.images ? syncedProduct.images.split(",").map((img: string) => img.trim()) : []}
              alt={syncedProduct.name}
              className="lg:pl-4 lg:pt-4 lg:pb-4"
              productSlug={syncedProduct.slug}
            />
          </div>

          {/* Product information */}
          <div 
            className="w-full lg:w-2/5 xl:w-1/3 px-4 lg:px-0 lg:h-[100dvh] lg:overflow-y-auto pt-4 pb-20 lg:pr-4 scrollbar-none product-info-enter"
          >
            <div className="space-y-6 w-full ">
              <h3>{syncedProduct.name}</h3>

              {/* Price */}
              <div className="flex gap-4 items-center">
                {currentDiscount ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="green">{currentDiscount}% OFF</Badge>
                    <div className="flex items-baseline gap-2">
                      <h4>
                        $
                        {(currentPrice * (1 - currentDiscount / 100)).toFixed(
                          2
                        )}{" "}
                        CAD
                      </h4>
                      <span className="line-through text-muted-foreground">
                        ${currentPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <h4>${currentPrice.toFixed(2)} CAD</h4>
                )}

                {/* Stock information - moved here and updated styling */}
                {!syncedProduct.unlimitedStock && (
                  <div>
                    {effectiveStock > 0 ? (
                      <Badge variant="outline">
                        <span className="text-muted-foreground">
                          In stock:{" "}
                        </span>
                        <span>{effectiveStock}</span>
                      </Badge>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Variation selection */}
              {syncedProduct.hasVariations && attributeNames.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {attributeNames.map((attributeId) => (
                    <FilterGroup
                      key={attributeId}
                      title={getAttributeDisplayName(attributeId)}
                      options={getUniqueAttributeValues(attributeId)}
                      selectedOptions={selectedAttributes[attributeId] || null}
                      onOptionChange={(value) => {
                        if (value) {
                          selectVariation(attributeId, value);
                        }
                      }}
                      showAllOption={false}
                      variant="default"
                      getOptionAvailability={(value) =>
                        isAttributeValueAvailable(attributeId, value)
                      }
                      titleClassName=""
                      className=""
                    />
                  ))}
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
                    syncedProduct.unlimitedStock ? undefined : effectiveStock
                  }
                  disabled={!canAddToCart}
                  size="default"
                />
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  disabled={!canAddToCart}
                  cursorType={canAddToCart ? "add" : "default"}
                >
                  {canAddToCart ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-6 text-sm">
                {syncedProduct.category && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Category</span>
                    <Link
                      to="/store"
                      search={{ category: syncedProduct.category.slug }}
                      className="text-primary hover:underline"
                    >
                      {syncedProduct.category.name}
                    </Link>
                  </div>
                )}
                {/* {product.brand && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Brand</span>
                    <Link
                      to="/store"
                      search={{ brand: product.brand.slug }}
                      className="text-primary hover:underline"
                    >
                      {product.brand.name}
                    </Link>
                  </div>
                )} */}
                {currentShippingFrom && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Ships from</span>
                    <span className="text-foreground">
                      {(() => {
                        const country = getCountryByCode(currentShippingFrom);
                        return country?.name || currentShippingFrom;
                      })()}
                    </span>
                  </div>
                )}
              </div>

              {/* Blog post link */}
              {syncedProduct?.blogPost && (
                <div className="pt-4">
                  <div className="mb-2">
                    {syncedProduct.blogPost.title ? (
                      <>
                        <span className="text-muted-foreground">
                          From blog post:
                        </span>{" "}
                        <Link
                          to={syncedProduct.blogPost.blogUrl}
                          className="blurLink"
                        >
                          {syncedProduct.blogPost.title}
                        </Link>
                      </>
                    ) : (
                      <Link to={syncedProduct.blogPost.blogUrl} className="blurLink">
                        From blog post
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Product description */}
              <div className="prose max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {syncedProduct.description || ""}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
