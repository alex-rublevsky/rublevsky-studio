import { createFileRoute } from "@tanstack/react-router";
import ImageGallery from "~/components/ui/shared/ImageGallery";
import { useState, useEffect, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { Button } from "~/components/ui/shared/Button";
import { Link } from "@tanstack/react-router";
import { useCart } from "~/lib/cartContext";
import { QuantitySelector } from "~/components/ui/shared/QuantitySelector";
import { getAttributeDisplayName } from "~/lib/productAttributes";
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

export const Route = createFileRoute("/store/$productId")({
  component: ProductPage,
  loader: async ({ params }) => {
    return {
      productId: params.productId,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: ({ error }) => <div>Error: {error.message}</div>,
});

function ProductPage() {
  const { productId } = Route.useLoaderData();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const { addProductToCart, cart, products } = useCart();

  // Query product data
  const { isPending, error, data } = useQuery<ProductWithDetails>({
    queryKey: [`product`, productId],
    staleTime: 1000 * 60 * 60 * 1, // 1 hour
    queryFn: () =>
      fetch(`${DEPLOY_URL}/api/store/${productId}`).then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      }),
  });

  // Update product state when data changes
  useEffect(() => {
    if (data) {
      setProduct(data);
    }
  }, [data]);

  // Sync product data with cart context (similar to your Next.js version)
  useEffect(() => {
    if (!product) return;

    // Find the product in the cart context cache
    const cachedProduct = products.find((p) => p.id === product.id);
    if (cachedProduct) {
      // Update local product state with cached data for stock info
      setProduct((prev) => ({
        ...prev!,
        stock: cachedProduct.stock,
        unlimitedStock: cachedProduct.unlimitedStock,
        variations: cachedProduct.variations,
      }));
    }
  }, [product?.id, products]);

  // Variation selection hook - always call but pass null product when not loaded
  const {
    selectedVariation,
    selectedAttributes,
    selectVariation,
    isAttributeValueAvailable,
  } = useVariationSelection({
    product: product as ProductWithVariations | null,
    cartItems: cart.items,
    onVariationChange: () => setQuantity(1), // Reset quantity when variation changes
  });

  // Calculate current price based on selected variation
  const currentPrice = useMemo(() => {
    if (selectedVariation) {
      return selectedVariation.price;
    }
    return product?.price || 0;
  }, [selectedVariation, product?.price]);

  // Calculate effective stock based on selected variation
  const effectiveStock = useMemo(() => {
    if (!product) return 0;

    if (product.unlimitedStock) {
      return Number.MAX_SAFE_INTEGER;
    }

    return getAvailableQuantityForVariation(
      product as ProductWithVariations,
      selectedVariation?.id,
      cart.items
    );
  }, [product, selectedVariation, cart.items]);

  // Check if product can be added to cart
  const canAddToCart = useMemo(() => {
    if (!product?.isActive) return false;
    if (product.hasVariations && !selectedVariation) return false;
    if (!product.unlimitedStock && effectiveStock <= 0) return false;
    return true;
  }, [product, selectedVariation, effectiveStock]);

  // Define all callbacks before any conditional returns
  const incrementQuantity = useCallback(() => {
    if (product?.unlimitedStock || quantity < effectiveStock) {
      setQuantity((prev) => prev + 1);
    }
  }, [quantity, effectiveStock, product?.unlimitedStock]);

  const decrementQuantity = useCallback(() => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  }, [quantity]);

  const getUniqueAttributeValues = useCallback(
    (attributeId: string): string[] => {
      if (!product?.variations) return [];

      const sortedVariations = [...product.variations].sort(
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
    [product?.variations]
  );

  // Handle add to cart
  const handleAddToCart = useCallback(async () => {
    if (!product || !canAddToCart) return;

    const success = await addProductToCart(
      product,
      quantity,
      selectedVariation,
      selectedAttributes
    );

    if (success) {
      setQuantity(1); // Reset quantity after successful add
    }
  }, [
    product,
    quantity,
    selectedVariation,
    selectedAttributes,
    canAddToCart,
    addProductToCart,
  ]);

  // Update product state when data changes
  useEffect(() => {
    if (data) {
      setProduct(data);
    }
  }, [data]);

  // Wait for data to be loaded before rendering
  if (isPending)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading product...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error: {error.message}
      </div>
    );
  if (!product)
    return (
      <div className="flex items-center justify-center h-screen">
        Product not found
      </div>
    );

  // Helper functions that don't need to be memoized
  const getImages = (): string[] => {
    if (!product || !product.images) return [];
    return product.images.split(",").map((img: string) => img.trim());
  };

  const getUniqueAttributeNames = (): string[] => {
    if (!product?.variations) return [];

    const attributeNames = new Set<string>();
    product.variations.forEach((variation) => {
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
          {/* Image gallery */}
          <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col lg:flex-row gap-2 lg:h-full self-start">
            {product.images!.length > 0 && (
              <ImageGallery
                images={product
                  .images!.split(",")
                  .map((img: string) => img.trim())}
                alt={product.name}
                className="lg:pl-4 lg:pt-4 lg:pb-4"
              />
            )}
          </div>

          {/* Product information */}
          <div className="w-full lg:w-2/5 xl:w-1/3 px-4 lg:px-0 lg:h-[100dvh] lg:overflow-y-auto pt-4 pb-20 lg:pr-4 scrollbar-none">
            <div className="space-y-6 w-full ">
              <h3>{product.name}</h3>

              {/* Price */}
              <div className="flex gap-4 items-center">
                {product.discount ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="green">{product.discount}% OFF</Badge>
                    <div className="flex items-baseline gap-2">
                      <h4>
                        $
                        {(currentPrice * (1 - product.discount / 100)).toFixed(
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
                {!product.unlimitedStock && (
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
              {product.hasVariations && attributeNames.length > 0 && (
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
                    product.unlimitedStock ? undefined : effectiveStock
                  }
                  disabled={!canAddToCart}
                  size="default"
                />
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  disabled={!canAddToCart}
                  cursorType={canAddToCart ? "add" : "disabled"}
                >
                  {canAddToCart ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>

              {/* Blog post link */}
              {product?.blogPost && (
                <div className="pt-4">
                  <div className="mb-2">
                    {product.blogPost.title ? (
                      <>
                        <span className="text-muted-foreground">
                          From blog post:
                        </span>{" "}
                        <Link
                          to={product.blogPost.blogUrl}
                          className="blurLink"
                        >
                          {product.blogPost.title}
                        </Link>
                      </>
                    ) : (
                      <Link to={product.blogPost.blogUrl} className="blurLink">
                        From blog post
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Product description */}
              <div className="prose max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {product.description || ""}
                </ReactMarkdown>
              </div>

              {/* Metadata */}
              <div className="space-y-2 text-sm text-muted-foreground">
                {product.category && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Category:</span>
                    <Link
                      to="/store"
                      search={{ category: product.category.slug }}
                      className="text-primary hover:underline"
                    >
                      {product.category.name}
                    </Link>
                  </div>
                )}
                {product.brand && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Brand:</span>
                    <Link
                      to="/store"
                      search={{ brand: product.brand.slug }}
                      className="text-primary hover:underline"
                    >
                      {product.brand.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
