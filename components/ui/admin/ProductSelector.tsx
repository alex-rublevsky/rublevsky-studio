import React, { useState, useEffect, useRef } from "react";
import { getProductsForSelection } from "@/lib/actions/products";
import Image from "next/image";

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
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Find the selected product when products are loaded or selectedProductSlug changes
    if (products.length > 0 && selectedProductSlug) {
      const product = products.find((p) => p.slug === selectedProductSlug);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [products, selectedProductSlug]);

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

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const productsData = await getProductsForSelection();
      setProducts(productsData || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    onProductSelect(product.slug);
    setShowDropdown(false);
    setSearchTerm("");
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
    onProductSelect("");
    // Focus the search input after clearing
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        setShowDropdown(true);
      }
    }, 0);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Parse images for the selected product
  const getProductImage = (product: Product): string => {
    try {
      // Handle case where images might be a string (JSON) or already an array
      let imageArray: string[] = [];

      if (typeof product.images === "string") {
        try {
          imageArray = JSON.parse(product.images);
        } catch (e) {
          // If parsing fails, use empty array
          imageArray = [];
        }
      } else if (Array.isArray(product.images)) {
        imageArray = product.images;
      }

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
        <div className="flex items-center space-x-2 p-2 border rounded">
          {getProductImage(selectedProduct) && (
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image
                src={getProductImage(selectedProduct)}
                alt={selectedProduct.name}
                fill
                className="object-cover rounded"
              />
            </div>
          )}
          <div className="flex-grow">
            <p className="font-medium">{selectedProduct.name}</p>
            <p className="text-sm text-gray-500">{selectedProduct.slug}</p>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="text-red-500 hover:text-red-700"
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
            onFocus={() => setShowDropdown(true)}
            className="w-full px-3 py-2 border rounded"
            ref={searchInputRef}
          />
          <button
            type="button"
            onClick={toggleDropdown}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            {showDropdown ? "▲" : "▼"}
          </button>
        </div>
      )}

      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-center">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-2 text-center">No products found</div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              >
                {getProductImage(product) && (
                  <div className="w-8 h-8 relative flex-shrink-0 mr-2">
                    <Image
                      src={getProductImage(product)}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.slug}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
