"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Constants for R2 image handling
const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_URL;

// Product interfaces
interface ProductVariant {
  size: string;
  price: number;
  stockCount: number;
}

interface Product {
  id: string;
  name: string;
  type: "t-shirt" | "hoodie" | "poster" | "sticker";
  category: "clothing" | "prints" | "accessories";
  images: string[];
  description: string;
  variants: ProductVariant[];
}

// Mock product data
const CLOTHING_SIZES: ProductVariant[] = [
  { size: "S", price: 29.99, stockCount: 5 },
  { size: "M", price: 29.99, stockCount: 8 },
  { size: "L", price: 29.99, stockCount: 10 },
  { size: "XL", price: 34.99, stockCount: 3 },
];

const HOODIE_SIZES: ProductVariant[] = [
  { size: "S", price: 49.99, stockCount: 3 },
  { size: "M", price: 49.99, stockCount: 6 },
  { size: "L", price: 49.99, stockCount: 4 },
  { size: "XL", price: 54.99, stockCount: 2 },
];

const POSTER_SIZES: ProductVariant[] = [
  { size: "18x24", price: 24.99, stockCount: 15 },
  { size: "24x36", price: 34.99, stockCount: 10 },
];

const mockProducts: Product[] = [
  {
    id: "yin-yan-shirt",
    name: "Yin Yang Graffiti Tee",
    type: "t-shirt",
    category: "clothing",
    images: [
      "yin-yan-shirt-1.jpg",
      "yin-yan-shirt-2.jpg",
      "yin-yan-shirt-3.jpg",
      "yin-yan-shirt-4.jpg",
      "yin-yan-shirt-5.jpg",
      "yin-yan-shirt-6.jpg",
    ],
    description:
      "Urban street style meets ancient philosophy in this unique screen-printed design.",
    variants: CLOTHING_SIZES,
  },
  {
    id: "urban-chaos-hoodie",
    name: "Urban Chaos Hoodie",
    type: "hoodie",
    category: "clothing",
    images: [
      "yin-yan-shirt-6.jpg",
      "yin-yan-shirt-5.jpg",
      "yin-yan-shirt-4.jpg",
      "yin-yan-shirt-3.jpg",
      "yin-yan-shirt-2.jpg",
      "yin-yan-shirt-1.jpg",
    ],
    description:
      "Premium quality hoodie featuring our signature urban chaos design.",
    variants: HOODIE_SIZES,
  },
  {
    id: "street-dreams-poster",
    name: "Street Dreams Art Print",
    type: "poster",
    category: "prints",
    images: [
      "yin-yan-shirt-2.jpg",
      "yin-yan-shirt-3.jpg",
      "yin-yan-shirt-1.jpg",
      "yin-yan-shirt-4.jpg",
      "yin-yan-shirt-5.jpg",
      "yin-yan-shirt-6.jpg",
    ],
    description: "Limited edition art print showcasing urban street culture.",
    variants: POSTER_SIZES,
  },
  {
    id: "midnight-rider-tee",
    name: "Midnight Rider T-Shirt",
    type: "t-shirt",
    category: "clothing",
    images: [
      "yin-yan-shirt-4.jpg",
      "yin-yan-shirt-1.jpg",
      "yin-yan-shirt-2.jpg",
      "yin-yan-shirt-3.jpg",
      "yin-yan-shirt-5.jpg",
      "yin-yan-shirt-6.jpg",
    ],
    description: "Dark and mysterious design perfect for night owls.",
    variants: CLOTHING_SIZES,
  },
  {
    id: "yin-yan-shirt-v2",
    name: "Yin Yang Graffiti Tee V2",
    type: "t-shirt",
    category: "clothing",
    images: [
      "yin-yan-shirt-3.jpg",
      "yin-yan-shirt-1.jpg",
      "yin-yan-shirt-2.jpg",
      "yin-yan-shirt-4.jpg",
      "yin-yan-shirt-5.jpg",
      "yin-yan-shirt-6.jpg",
    ],
    description:
      "Second edition of our popular urban street style meets ancient philosophy design.",
    variants: CLOTHING_SIZES,
  },
  {
    id: "urban-chaos-hoodie-black",
    name: "Urban Chaos Hoodie Black",
    type: "hoodie",
    category: "clothing",
    images: [
      "yin-yan-shirt-5.jpg",
      "yin-yan-shirt-6.jpg",
      "yin-yan-shirt-4.jpg",
      "yin-yan-shirt-3.jpg",
      "yin-yan-shirt-2.jpg",
      "yin-yan-shirt-1.jpg",
    ],
    description:
      "Black edition of our premium quality hoodie with signature urban chaos design.",
    variants: HOODIE_SIZES,
  },
  {
    id: "street-dreams-poster-xl",
    name: "Street Dreams Art Print XL",
    type: "poster",
    category: "prints",
    images: [
      "yin-yan-shirt-1.jpg",
      "yin-yan-shirt-3.jpg",
      "yin-yan-shirt-2.jpg",
      "yin-yan-shirt-4.jpg",
      "yin-yan-shirt-5.jpg",
      "yin-yan-shirt-6.jpg",
    ],
    description: "Extra large edition of our urban street culture art print.",
    variants: POSTER_SIZES,
  },
  {
    id: "midnight-rider-hoodie",
    name: "Midnight Rider Hoodie",
    type: "hoodie",
    category: "clothing",
    images: [
      "yin-yan-shirt-2.jpg",
      "yin-yan-shirt-1.jpg",
      "yin-yan-shirt-4.jpg",
      "yin-yan-shirt-3.jpg",
      "yin-yan-shirt-5.jpg",
      "yin-yan-shirt-6.jpg",
    ],
    description: "Hoodie version of our popular Midnight Rider design.",
    variants: HOODIE_SIZES,
  },
];

// Helper function to generate R2 image URL
const getR2ImageUrl = (imagePath: string) => `${R2_DOMAIN}/${imagePath}`;

export default function StorePage() {
  const [selectedImage, setSelectedImage] = useState(mockProducts[0].images[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    mockProducts[0].variants[0].size
  );

  const selectedVariant = selectedSize
    ? mockProducts[0].variants.find((v) => v.size === selectedSize)
    : null;

  const currentPrice =
    selectedVariant?.price ?? mockProducts[0].variants[0].price;
  const currentStock = selectedVariant?.stockCount ?? 0;
  const canAddToCart: boolean = selectedSize !== null && currentStock > 0;

  return (
    <main>
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-[95rem] mx-auto items-start">
          {mockProducts.map((product) => (
            <div
              key={product.id}
              className="w-full overflow-hidden rounded-lg group transition-all duration-300 ease-in-out hover:scale-[102%] hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={getR2ImageUrl(product.images[0])}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-500 ease-in-out group-hover:scale-[105%]"
                />
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-baseline justify-between w-full gap-x-2 ">
                  <span className="text-xl font-light text-black whitespace-nowrap">
                    CAD {product.variants[0].price.toFixed(2)}
                  </span>
                  <span className="text-sm whitespace-nowrap">
                    In stock:{" "}
                    {product.variants.reduce(
                      (sum, variant) => sum + variant.stockCount,
                      0
                    )}
                  </span>
                </div>

                <h3 className="text-base">{product.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
