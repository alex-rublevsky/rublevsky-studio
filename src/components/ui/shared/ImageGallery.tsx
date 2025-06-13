import { Image } from "~/components/ui/shared/Image";
import { useState, useRef, useEffect, useCallback } from "react";
import { VariantProps, cva } from "class-variance-authority";

const mainImageVariants = cva(
  "max-w-full w-full lg:w-auto object-contain rounded-none lg:rounded-lg relative z-2",
  {
    variants: {
      size: {
        default: "max-h-[calc(100vh-5rem)]",
        compact: "max-h-[70vh]",
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
  productSlug?: string;
}

export default function ImageGallery({
  images,
  alt,
  className = "",
  size,
  productSlug,
}: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const mainImageContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced scroll handler for mobile
  const handleScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current || window.matchMedia("(min-width: 1024px)").matches) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (mainImageContainerRef.current) {
        const containerWidth = mainImageContainerRef.current.clientWidth;
        const scrollLeft = mainImageContainerRef.current.scrollLeft;
        const newIndex = Math.round(scrollLeft / containerWidth);

        if (newIndex >= 0 && newIndex < images.length && newIndex !== currentImageIndex) {
          setCurrentImageIndex(newIndex);
        }
      }
    }, 50);
  }, [images, currentImageIndex]);

  // Scroll to image on mobile
  const scrollToImage = useCallback((index: number) => {
    if (mainImageContainerRef.current && !window.matchMedia("(min-width: 1024px)").matches) {
      isProgrammaticScrollRef.current = true;
      const containerWidth = mainImageContainerRef.current.clientWidth;

      requestAnimationFrame(() => {
        mainImageContainerRef.current?.scrollTo({
          left: index * containerWidth,
          behavior: "smooth",
        });
      });

      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 200);
    }
    setCurrentImageIndex(index);
  }, []);

  // Center thumbnail on mobile
  useEffect(() => {
    if (thumbnailsContainerRef.current && !window.matchMedia("(min-width: 1024px)").matches) {
      const container = thumbnailsContainerRef.current;
      const thumbnailWidth = 96;
      const containerWidth = container.clientWidth;
      const scrollPosition = currentImageIndex * thumbnailWidth - (containerWidth - thumbnailWidth) / 2;

      requestAnimationFrame(() => {
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: "smooth",
        });
      });
    }
  }, [currentImageIndex]);

  // Add scroll event listener for mobile
  useEffect(() => {
    const container = mainImageContainerRef.current;
    if (container && !window.matchMedia("(min-width: 1024px)").matches) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        container.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [handleScroll]);

  if (!images.length) {
    return (
      <div className="w-full h-[75vh] bg-muted flex items-center justify-center rounded-lg relative">
        {/* Always render a view transition element even when no images */}
        <div
          style={{ viewTransitionName: `product-image-${productSlug}`, opacity: 0, position: 'absolute' }}
          className="w-1 h-1"
        />
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <div className={`gallery-stack flex flex-col lg:flex-row w-full gap-2 ${className}`}>
      {/* Thumbnails */}
      <div className="order-2 lg:order-1 shrink-0 w-full lg:w-24 overflow-x-auto lg:overflow-x-hidden scrollbar-none">
        <div
          ref={thumbnailsContainerRef}
          className="no-scrollbar flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto px-4 lg:px-0 scroll-smooth"
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="shrink-0 w-24 h-24 relative cursor-pointer last:mb-2"
              onClick={() => scrollToImage(index)}
              onMouseEnter={() => {
                if (window.matchMedia("(min-width: 1024px)").matches) {
                  setCurrentImageIndex(index);
                }
              }}
            >
              <div className="absolute inset-0 rounded-sm overflow-hidden">
                <div
                  className={`
                    absolute inset-0 rounded-sm
                    ${currentImageIndex === index ? "border-2 border-black" : "border border-transparent"}
                    transition-colors duration-200 pointer-events-none z-10
                  `}
                />
                <Image
                  src={`/${image}`}
                  alt={`${alt} thumbnail ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main image container */}
      <div className="flex items-center justify-center lg:items-start lg:justify-start order-1 grow relative">
        
        {/* ALWAYS VISIBLE: First image with view transition name - this is the key element for view transitions */}
        <img
          src={`https://assets.rublevsky.studio/${images[0]}`}
          alt={`${alt} main image`}
          width={3000}
          height={3000}
          loading="eager"
          className={`${mainImageVariants({ size })} ${currentImageIndex === 0 ? 'block' : 'hidden lg:hidden'}`}
          style={{ viewTransitionName: `product-image-${productSlug}` }}
        />

        {/* Desktop: Show selected image if not first image */}
        {currentImageIndex !== 0 && (
          <img
            src={`https://assets.rublevsky.studio/${images[currentImageIndex]}`}
            alt={`${alt} main image`}
            width={3000}
            height={3000}
            loading="eager"
            className={`${mainImageVariants({ size })} hidden lg:block`}
          />
        )}

        {/* Mobile: Scrollable gallery (only for navigation, not view transitions) */}
        <div
          ref={mainImageContainerRef}
          className="lg:hidden relative w-full h-[60vh] overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory"
        >
          <div className="flex h-full">
            {images.map((image, index) => (
              <div
                key={index}
                className="shrink-0 w-full snap-center flex items-center justify-center"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="relative w-auto h-full flex items-center justify-center">
                    <Image
                      src={`/${image}`}
                      alt={`${alt} main image ${index + 1}`}
                      width={3000}
                      height={3000}
                      className={mainImageVariants({ size })}
                      style={{
                        maxHeight: "100%",
                        width: "auto",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
