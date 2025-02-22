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
  const canAddToCart = selectedSize !== null && quantity > 0;

  const handleImageSelect = (image: string) => {
    setSelectedImage(image);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <Image
            src={getR2ImageUrl(selectedImage)}
            alt={mockProducts[0].name}
            width={500}
            height={500}
            className="rounded-lg"
          />
          <div className="flex mt-4 gap-2">
            {mockProducts[0].images.map((image, index) => (
              <Button
                key={index}
                onClick={() => handleImageSelect(image)}
                variant={selectedImage === image ? "default" : "outline"}
              >
                <Image
                  src={getR2ImageUrl(image)}
                  alt={`${mockProducts[0].name} thumbnail ${index + 1}`}
                  width={50}
                  height={50}
                  className="rounded"
                />
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{mockProducts[0].name}</h1>
          <p>{mockProducts[0].description}</p>

          <div className="flex gap-2">
            {mockProducts[0].variants.map((variant) => (
              <Button
                key={variant.size}
                onClick={() => handleSizeSelect(variant.size)}
                variant={selectedSize === variant.size ? "default" : "outline"}
              >
                {variant.size}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span>{quantity}</span>
            <Button onClick={() => handleQuantityChange(quantity + 1)}>
              +
            </Button>
          </div>

          <div className="text-xl font-bold">
            ${(currentPrice * quantity).toFixed(2)}
          </div>

          <Button
            className="w-full"
            disabled={!canAddToCart}
            onClick={() => alert("Added to cart!")}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
