import React, { useState, useEffect, useRef } from "react";
import { Image } from "~/components/ui/shared/Image";
import { DEPLOY_URL } from "~/utils/store";

interface Product {
  id: number;
  name: string;
  slug: string;
  images: string | null;
}

interface ProductSelectorProps {
  selectedProductSlug: string;
  onProductSelect: (productSlug: string) => void;
}

export default function ProductSelector({
  selectedProductSlug,
  onProductSelect,
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find the selected product when products are loaded or selectedProductSlug changes
    if (products.length > 0 && selectedProductSlug) {
      const product = products.find((p) => p.slug === selectedProductSlug);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [products, selectedProductSlug]);

  // Single function to handle opening dropdown and fetching products
  const openDropdown = async () => {
    setShowDropdown(true);
    searchInputRef.current?.focus();
    
    // Only fetch if we don't have products yet and aren't already loading
    if (products.length === 0 && !isLoading) {
      try {
        setIsLoading(true);
        const response = await fetch(`${DEPLOY_URL}/api/dashboard/products`);
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }
        const data = await response.json() as { products: Product[] };
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    onProductSelect(product.slug);
    setShowDropdown(false);
    setSearchTerm("");
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
    onProductSelect("");
    openDropdown();
  };

  const toggleDropdown = () => {
    if (showDropdown) {
      setShowDropdown(false);
    } else {
      openDropdown();
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Parse images for the selected product
  const getProductImage = (product: Product): string => {
    try {
      if (!product.images) return "/placeholder.jpg";

      // Split comma-separated string into array and add leading slash
      const imageArray = product.images
        .split(",")
        .map((img) => `/${img.trim()}`);

      // Return the first image or a placeholder
      return imageArray.length > 0 ? imageArray[0] : "/placeholder.jpg";
    } catch (error) {
      console.error("Error parsing product images:", error);
      return "/placeholder.jpg";
    }
  };

  return (
    <div className="relative" ref={componentRef}>
      {selectedProduct ? (
        <div className="flex items-center space-x-2 p-2 border border-input rounded bg-card">
          {getProductImage(selectedProduct) && (
            <div className="w-10 h-10 relative shrink-0">
              <Image
                src={getProductImage(selectedProduct)}
                alt={selectedProduct.name}
                className="object-cover rounded"
              />
            </div>
          )}
          <div className="grow">
            <p className="font-medium">{selectedProduct.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedProduct.slug}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="text-destructive hover:text-destructive/80"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={openDropdown}
            className="w-full px-3 py-2 bg-muted border border-input rounded"
            ref={searchInputRef}
          />
          <button
            type="button"
            onClick={toggleDropdown}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          >
            {showDropdown ? "▲" : "▼"}
          </button>
        </div>
      )}

      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-input rounded shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-center text-muted-foreground">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-2 text-center text-muted-foreground">
              No products found
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className="flex items-center p-2 hover:bg-muted cursor-pointer"
              >
                {getProductImage(product) && (
                  <div className="w-8 h-8 relative shrink-0 mr-2">
                    <Image
                      src={getProductImage(product)}
                      alt={product.name}
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.slug}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
