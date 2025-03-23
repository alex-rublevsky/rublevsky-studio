import Image from "next/image";
import { useState, useMemo } from "react";
import { VariantProps, cva } from "class-variance-authority";

const mainImageVariants = cva(
  "max-w-full w-full lg:w-auto object-contain rounded-none lg:rounded-lg relative z-2",
  {
    variants: {
      size: {
        default: "max-h-[calc(100vh-5rem)]",
        compact: "max-h-[86vh]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface ImageGalleryProps extends VariantProps<typeof mainImageVariants> {
  images: string[];
  alt: string;
  className?: string;
}

export default function ImageGallery({
  images,
  alt,
  className = "",
  size,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");

  // Memoize the Image component to prevent unnecessary re-renders
  const memoizedImage = useMemo(() => {
    if (!selectedImage) return null;

    return (
      <Image
        src={`/${selectedImage}`}
        alt={`${alt} main image`}
        width={3000}
        height={3000}
        priority
        className={mainImageVariants({ size })}
      />
    );
  }, [selectedImage, alt, size]);

  if (!images.length) {
    return (
      <div className="w-full h-[75vh] bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div
      className={`gallery-stack flex flex-col lg:flex-row w-full gap-2 ${className}`}
    >
      {/* Thumbnails */}
      <div className="order-2 lg:order-1 shrink-0 w-full lg:w-24 overflow-x-auto lg:overflow-x-hidden">
        {/* Scrollable container */}
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto px-4 lg:px-0">
          {images.map((image, index) => (
            <div
              key={index}
              className="
                shrink-0
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
                  alt={`${alt} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main image */}
      <div className="flex items-center justify-center lg:items-start lg:justify-start order-1 grow relative">
        <div className="relative w-full">
          {selectedImage ? (
            <div className="relative">{memoizedImage}</div>
          ) : (
            <div className="w-full h-[75vh] bg-gray-100 flex items-center justify-center rounded-lg">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
