"use client";
import { Product } from "@/types";
import Image from "next/image";
import { useState } from "react";

function ProductGallery({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Get images array from product
  const getImages = (): string[] => {
    if (!product || !product.images) return [];
    try {
      return JSON.parse(product.images) as string[];
    } catch (e) {
      console.error("Error parsing product images:", e);
      return [];
    }
  };

  // Extract images from product
  const images = getImages();

  return (
    <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col lg:flex-row gap-2 lg:h-full self-start">
      <div className="gallery-stack flex flex-col lg:flex-row w-full gap-2">
        {/* Thumbnails */}
        <div className="order-2 lg:order-1 flex-shrink-0 w-full lg:w-24 overflow-x-auto lg:overflow-x-hidden">
          {/* Scrollable container */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto px-4 lg:px-0">
            {images.map((image, index) => (
              <div
                key={index}
                className="
              flex-shrink-0
              w-24 h-24
              relative
              cursor-pointer
              last:mb-2
            "
                onClick={() => setSelectedImage(index)}
                onMouseEnter={() => {
                  // Only change image on hover for desktop
                  if (window.matchMedia("(min-width: 1024px)").matches) {
                    setSelectedImage(index);
                  }
                }}
              >
                <div
                  className={`
              absolute inset-0
              rounded-lg
              ${selectedImage === index ? "border-2 border-black" : "border border-transparent"}
              transition-colors duration-200
            `}
                />
                <div className="absolute inset-[2px] rounded-[6px] overflow-hidden">
                  <Image
                    src={`/${image}`}
                    alt={`${product.name} thumbnail ${index + 1}`}
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
              {images.length > 0 ? (
                <Image
                  src={`/${images[selectedImage]}`}
                  alt={`${product.name} main image`}
                  width={1200}
                  height={1200}
                  className="max-w-full w-full lg:w-auto max-h-[75vh] lg:max-h-[calc(100vh-6rem)] object-contain rounded-none lg:rounded-lg"
                  priority
                  sizes="(max-width: 1024px) 100vw"
                />
              ) : (
                <div className="w-full h-[75vh] bg-gray-100 flex items-center justify-center rounded-lg">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductGallery;
