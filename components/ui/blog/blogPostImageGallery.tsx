import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectCoverflow,
  Navigation,
  Pagination,
  Keyboard,
  Mousewheel,
} from "swiper/modules";
import { useEffect, useState, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import "./blogPostImageGallery.css";

interface BlogPostImageGalleryProps {
  images: string[];
  title: string;
}

function BlogPostImageGallery({ images, title }: BlogPostImageGalleryProps) {
  const [isReady, setIsReady] = useState(false);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const initializedRef = useRef(false);
  const imagesLoadedRef = useRef(0);

  // Reset the gallery when images change
  useEffect(() => {
    initializedRef.current = false;
    imagesLoadedRef.current = 0;
    setIsReady(false);
  }, [images]);

  // Handle image loading
  const handleImageLoad = () => {
    imagesLoadedRef.current += 1;

    // Only proceed when all images are loaded
    if (imagesLoadedRef.current >= Math.min(images.length, 3)) {
      if (swiper && !initializedRef.current) {
        // Reset to first slide with no animation
        swiper.slideTo(0, 0);
        initializedRef.current = true;

        // Delay showing the gallery to ensure proper rendering
        setTimeout(() => {
          setIsReady(true);
        }, 200);
      }
    }
  };

  // Ensure the first slide is always selected after initialization
  useEffect(() => {
    if (swiper && !initializedRef.current) {
      // Force slide to index 0 after initialization
      swiper.slideTo(0, 0);

      // If we already have some images loaded, we can initialize
      if (imagesLoadedRef.current >= Math.min(images.length, 3)) {
        initializedRef.current = true;
        setTimeout(() => {
          setIsReady(true);
        }, 100);
      }
    }
  }, [swiper, images]);

  // Additional handler to reset on visibility changes (when returning to the page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && swiper) {
        // When returning to the page, reset to first slide
        swiper.slideTo(0, 0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [swiper]);

  return (
    <>
      <div
        className={`relative left-[50%] right-[50%] w-screen -translate-x-1/2 mb-4 overflow-x-hidden ${
          isReady
            ? "blog-post-gallery-container-ready"
            : "blog-post-gallery-container-loading"
        }`}
      >
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          spaceBetween={-100}
          threshold={5}
          initialSlide={0}
          onSwiper={setSwiper}
          updateOnWindowResize={true}
          observer={true}
          observeParents={true}
          resizeObserver={true}
          keyboard={{
            enabled: true,
            onlyInViewport: true,
          }}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 0.01,
            releaseOnEdges: true,
            thresholdDelta: 5,
          }}
          coverflowEffect={{
            rotate: 8,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
          }}
          pagination={{
            clickable: true,
            el: ".swiper-pagination",
          }}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          modules={[
            EffectCoverflow,
            Navigation,
            Pagination,
            Keyboard,
            Mousewheel,
          ]}
          className="width-full overflow-visible !pb-12 relative py-12"
        >
          {images.map((image, index) => (
            <SwiperSlide
              key={index}
              className="w-auto max-w-[85%] transition-all duration-300 ease-in-out overflow-hidden origin-center opacity-[0.5] height-auto flex items-center justify-center"
            >
              <div className="relative w-auto overflow-hidden object-contain">
                <Image
                  src={`/${image}`}
                  alt={`Photo of ${title} number ${index + 1}`}
                  width={1000}
                  height={1000}
                  className="w-full h-auto max-h-[25rem] md:max-h-[30rem] max-w-full block cursor-zoom-in rounded-lg"
                  priority={index < 3}
                  onLoad={handleImageLoad}
                />
              </div>
            </SwiperSlide>
          ))}
          <div className="swiper-pagination"></div>
          <div className="swiper-button-prev"></div>
          <div className="swiper-button-next"></div>
        </Swiper>
      </div>
    </>
  );
}
export default BlogPostImageGallery;
