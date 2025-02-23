"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Mock product data structure
interface ProductVariant {
  size: string;
  price: number;
  stockCount: number;
}

interface Product {
  name: string;
  type: string;
  images: string[];
  description: string;
  variants: ProductVariant[];
}

// Mock product data
const MOCK_SIZES: ProductVariant[] = [
  { size: "S", price: 29.99, stockCount: 5 },
  { size: "M", price: 29.99, stockCount: 8 },
  { size: "L", price: 29.99, stockCount: 10 },
  { size: "XL", price: 34.99, stockCount: 3 },
];

const mockProduct: Product = {
  name: "Yin Yan Graffiti",
  type: "image",
  images: [
    "yin-yan-shirt-1.jpg",
    "yin-yan-shirt-2.jpg",
    "yin-yan-shirt-5.jpg",
    "yin-yan-shirt-4.jpg",
    "yin-yan-shirt-6.jpg",
    "yin-yan-shirt-3.jpg",
  ],
  description: "Screen Printing a Custom Design",
  variants: MOCK_SIZES,
};

export default function StorePage() {
  const [selectedImage, setSelectedImage] = useState(mockProduct.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    mockProduct.variants[0].size
  );

  const selectedVariant = selectedSize
    ? mockProduct.variants.find((v) => v.size === selectedSize)
    : null;

  const currentPrice = selectedVariant?.price ?? mockProduct.variants[0].price;
  const currentStock = selectedVariant?.stockCount ?? 0;
  const canAddToCart: boolean = selectedSize !== null && currentStock > 0;

  const incrementQuantity = () => {
    if (selectedVariant && quantity < selectedVariant.stockCount) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:h-screen lg:overflow-hidden">
      <div className="flex-grow flex items-start justify-center">
        <div className="w-full h-full flex flex-col lg:flex-row gap-0 lg:gap-10 items-start lg:p-4">
          {/* Image gallery */}
          <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col lg:flex-row gap-2 lg:h-full self-start">
            <div className="gallery-stack flex flex-col lg:flex-row w-full gap-2">
              {/* Thumbnails */}
              <div className="order-2 lg:order-1 flex-shrink-0 w-full lg:w-24 overflow-x-auto lg:overflow-x-hidden">
                {/* Scrollable container */}
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto  px-4 lg:px-0">
                  {mockProduct.images.map((image, index) => (
                    <div
                      key={index}
                      className="
                        flex-shrink-0
                        w-24 h-24
                        relative
                        cursor-pointer
                        last:mb-2
                      "
                      onClick={() => setSelectedImage(image)}
                      onMouseEnter={() => {
                        // Only change image on hover for desktop
                        if (window.matchMedia("(min-width: 1024px)").matches) {
                          setSelectedImage(image);
                        }
                      }}
                    >
                      <div
                        className={`
                        absolute inset-0
                        rounded-lg
                        ${selectedImage === image ? "border-2 border-black" : "border border-transparent"}
                        transition-colors duration-200
                      `}
                      />
                      <div className="absolute inset-[2px] rounded-[6px] overflow-hidden">
                        <Image
                          src={`/${image}`}
                          alt={`${mockProduct.name} thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main image */}
              <div className="order-1 lg:order-2 flex-grow w-full">
                <div className="flex items-center justify-center lg:items-start lg:justify-start">
                  <div className="relative w-full">
                    <Image
                      src={`/${selectedImage}`}
                      alt={`${mockProduct.name} main image`}
                      // TODO: remove width and height, substitute for fill?
                      width={1200}
                      height={1200}
                      className="max-w-full w-full lg:w-auto max-h-[75vh] lg:max-h-[calc(100vh-6rem)] object-contain rounded-none lg:rounded-lg"
                      priority
                      sizes="(max-width: 1024px) 100vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product information */}
          <div className="w-full lg:w-2/5 xl:w-1/3 px-4 lg:px-0 lg:min-h-[calc(100vh-2rem)] lg:flex lg:items-center mt-4 lg:mt-0 mb-40 lg:mb-0">
            <div className="space-y-6 w-full">
              <h3 className="">{mockProduct.name}</h3>

              {/* Size selection */}
              <div className="space-y-2">
                <h6 className="">Size</h6>
                <div className="flex flex-wrap gap-2">
                  {mockProduct.variants.map((variant) => (
                    <button
                      key={variant.size}
                      onClick={() => {
                        setSelectedSize(variant.size);
                        setQuantity(1);
                      }}
                      className={`px-4 py-2 border rounded-md transition-colors duration-200 ${
                        selectedSize === variant.size
                          ? "bg-black text-white"
                          : variant.stockCount > 0
                            ? "bg-white text-black hover:bg-gray-100"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={variant.stockCount === 0}
                    >
                      {variant.size}
                      {variant.stockCount === 0 && " - Sold Out"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock information */}
              {selectedVariant && (
                <div className="text-sm">
                  {selectedVariant.stockCount > 0 ? (
                    <p>In stock: {selectedVariant.stockCount}</p>
                  ) : (
                    <p className="text-red-600">Out of stock</p>
                  )}
                </div>
              )}

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
                      !canAddToCart ||
                      (selectedVariant !== null &&
                        selectedVariant !== undefined &&
                        quantity >= selectedVariant.stockCount)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      !canAddToCart ||
                      (selectedVariant !== null &&
                        selectedVariant !== undefined &&
                        quantity >= selectedVariant.stockCount)
                    }
                  >
                    <span className="text-2xl">+</span>
                  </button>
                </div>

                <Button
                  size="lg"
                  disabled={!canAddToCart}
                  onClick={() => canAddToCart && alert("Added to cart")}
                >
                  {selectedSize ? (
                    <>
                      Add to Cart <span className="opacity-75">CAD</span>{" "}
                      {(currentPrice * quantity).toFixed(2)}
                    </>
                  ) : (
                    "Select a size"
                  )}
                </Button>
              </div>

              {/* Description */}
              <div className="mt-8">
                <div className="">{mockProduct.description}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
