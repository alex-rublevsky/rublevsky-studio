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
import { ProductWithDetails, VariationAttribute } from "~/types";
import { Badge } from "~/components/ui/shared/Badge";
import { getAvailableQuantityForVariation } from "~/utils/validateStock";
import { useVariationSelection } from "~/hooks/useVariationSelection";
import { useQuery } from "@tanstack/react-query";
import { DEPLOY_URL } from "~/utils/store";

export const Route = createFileRoute("/product/$productId")({
  component: ProductPage,
  loader: async ({ params }) => {
    return {
      productId: params.productId,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: ({ error }) => <div>Error: {error.message}</div>,
});

async function getProduct(productId: string): Promise<ProductWithDetails> {
  return await fetch(`${DEPLOY_URL}/api/product/${productId}`).then((res) => {
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return res.json();
  });
}

function ProductPage() {
  const { productId } = Route.useLoaderData();

  const { isPending, error, data } = useQuery<ProductWithDetails>({
    queryKey: [`product`, productId],
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
    queryFn: () => getProduct(productId),
    retry: 3,
    refetchOnWindowFocus: false,
  });

  console.log(
    "product api link:",
    `${DEPLOY_URL}/api/product/${productId}`,
    "Product data:",
    data
  );

  const { addProductToCart, cart, products } = useCart();
  const [quantity, setQuantity] = useState(1);

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
  if (!data)
    return (
      <div className="flex items-center justify-center h-screen">
        Product not found
      </div>
    );

  // Now data is guaranteed to be available as ProductWithDetails
  const [product, setProduct] = useState<ProductWithDetails>(data);

  // Use the variation selection hook
  const {
    selectedVariation,
    selectedAttributes,
    selectVariation,
    isAttributeValueAvailable,
  } = useVariationSelection({
    product,
    cartItems: cart.items,
    onVariationChange: () => setQuantity(1), // Reset quantity when variation changes
  });

  // Sync product data with cart context
  useEffect(() => {
    if (!data) return;

    // Find the product in the cart context cache
    const cachedProduct = products.find((p) => p.id === data.id);
    if (cachedProduct) {
      // Update local product state with cached data
      setProduct((prev) => ({
        ...prev,
        stock: cachedProduct.stock,
        unlimitedStock: cachedProduct.unlimitedStock,
        variations: cachedProduct.variations,
      }));
    }
  }, [data, products]);

  // Calculate effective stock by subtracting cart quantities
  const getEffectiveStock = useMemo(() => {
    if (!product) return 0;

    return getAvailableQuantityForVariation(
      product,
      selectedVariation?.id,
      cart.items
    );
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
    return product.images.split(",").map((img: string) => img.trim());
  };

  // Get unique attribute names from all variations
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

  const images = getImages();
  const currentPrice = selectedVariation
    ? selectedVariation.price
    : product?.price || 0;

  // Use the effective stock instead of just the database stock
  const effectiveStock = getEffectiveStock;
  const canAddToCart = product?.isActive && effectiveStock > 0;
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
            {images.length > 0 && (
              <ImageGallery
                images={images}
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
                    ) : (
                      <Badge variant="outline">Out of stock</Badge>
                    )}
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
                      to="/product/$productId"
                      params={{
                        productId: product.category.slug,
                      }}
                    >
                      {product.category.name}
                    </Link>
                  </div>
                )}
                {product.brand && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Brand:</span>
                    {/* <Link
                      to="/store?brand=$brandId"
                      params={{
                        brandId: product.brand.slug,
                      }}
                    >
                      {product.brand.name}
                    </Link> */}
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
