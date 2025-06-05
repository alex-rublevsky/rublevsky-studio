import { Image } from "~/components/ui/shared/Image";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
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
}

export default function ImageGallery({
  images,
  alt,
  className = "",
  size,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");
  const mainImageContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedIndex = images.indexOf(selectedImage);

  // Debounced scroll handler to prevent rapid state updates
  const handleScroll = useCallback(() => {
    if (
      isProgrammaticScrollRef.current ||
      window.matchMedia("(min-width: 1024px)").matches
    )
      return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (mainImageContainerRef.current) {
        const containerWidth = mainImageContainerRef.current.clientWidth;
        const scrollLeft = mainImageContainerRef.current.scrollLeft;
        const newIndex = Math.round(scrollLeft / containerWidth);

        if (
          newIndex >= 0 &&
          newIndex < images.length &&
          newIndex !== selectedIndex
        ) {
          setSelectedImage(images[newIndex]);
        }
      }
    }, 50); // Small delay to ensure smooth scrolling
  }, [images, selectedIndex]);

  // Scroll to the selected image when thumbnail is clicked (mobile only)
  useEffect(() => {
    if (mainImageContainerRef.current) {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (!isDesktop) {
        isProgrammaticScrollRef.current = true;
        const containerWidth = mainImageContainerRef.current.clientWidth;

        // Use requestAnimationFrame for smoother animation
        requestAnimationFrame(() => {
          mainImageContainerRef.current?.scrollTo({
            left: selectedIndex * containerWidth,
            behavior: "smooth",
          });
        });

        // Reset the flag after the scroll animation completes
        const duration = 200; // Reduced from 300ms to 200ms for faster animation
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, duration);
      }
    }
  }, [selectedImage, selectedIndex]);

  // Center the active thumbnail in the container (mobile only)
  useEffect(() => {
    if (
      thumbnailsContainerRef.current &&
      !window.matchMedia("(min-width: 1024px)").matches
    ) {
      const container = thumbnailsContainerRef.current;
      const thumbnailWidth = 96; // 24 * 4 (w-24 = 6rem = 96px)
      const containerWidth = container.clientWidth;
      const scrollPosition =
        selectedIndex * thumbnailWidth - (containerWidth - thumbnailWidth) / 2;

      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: "smooth",
        });
      });
    }
  }, [selectedIndex]);

  // Add scroll event listener (mobile only)
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

  // Memoize the Image component to prevent unnecessary re-renders
  const memoizedImages = useMemo(() => {
    return images.map((image, index) => (
      <div
        key={index}
        className="shrink-0 w-full lg:hidden snap-center flex items-center justify-center"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-auto h-full flex items-center justify-center">
            <Image
              src={`/${image}`}
              alt={`${alt} main image ${index + 1}`}
              width={3000}
              height={3000}
              //priority={index === 0}
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
    ));
  }, [images, alt, size]);

  // Memoize the selected image for desktop
  const selectedImageDesktop = useMemo(() => {
    return (
      <div className="hidden lg:block">
        <Image
          src={`/${selectedImage}`}
          alt={`${alt} main image`}
          width={3000}
          height={3000}
          loading="eager"
          //priority
          className={`${mainImageVariants({ size })}`}
          style={{ viewTransitionName: `branding-image-${selectedImage}` }}
        />
      </div>
    );
  }, [selectedImage, alt, size]);

  if (!images.length) {
    return (
      <div className="w-full h-[75vh] bg-muted flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <div
      className={`gallery-stack flex flex-col lg:flex-row w-full gap-2 ${className}`}
    >
      {/* Thumbnails */}
      <div className="order-2 lg:order-1 shrink-0 w-full lg:w-24 overflow-x-auto lg:overflow-x-hidden scrollbar-none">
        {/* Scrollable container */}
        <div
          ref={thumbnailsContainerRef}
          className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto px-4 lg:px-0 scroll-smooth scrollbar-none"
        >
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
              <div className="absolute inset-0 rounded-sm overflow-hidden">
                <div
                  className={`
                    absolute inset-0
                    rounded-sm
                    ${selectedImage === image ? "border-2 border-black" : "border border-transparent"}
                    transition-colors duration-200
                    pointer-events-none
                    z-10
                  `}
                />
                <Image
                  src={`/${image}`}
                  alt={`${alt} thumbnail ${index + 1}`}
                  //fill
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main image */}
      <div className="flex items-center justify-center lg:items-start lg:justify-start order-1 grow relative">
        <div
          ref={mainImageContainerRef}
          className="relative w-full h-[60vh] lg:h-auto overflow-x-auto lg:overflow-x-hidden overflow-y-hidden scroll-smooth snap-x snap-mandatory scrollbar-none lg:snap-none [scroll-behavior:200ms_ease-in-out]"
        >
          {/* Mobile sliding images */}
          <div className="flex lg:hidden h-full">{memoizedImages}</div>
          {/* Desktop selected image */}
          {selectedImageDesktop}
        </div>
      </div>
    </div>
  );
}
