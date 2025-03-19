import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectCoverflow,
  Navigation,
  Pagination,
  Keyboard,
  Mousewheel,
} from "swiper/modules";
import { useEffect, useRef, memo } from "react";
import type { Swiper as SwiperType } from "swiper";
import "./blogPostImageGallery.css";

interface BlogPostImageGalleryProps {
  images: string[];
  title?: string;
  slug: string;
}

function BlogPostImageGallery({
  images,
  title,
  slug,
}: BlogPostImageGalleryProps) {
  const swiperElRef = useRef<SwiperType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset Swiper on mount
    const resetSwiper = () => {
      if (swiperElRef.current) {
        swiperElRef.current.slideTo(0);
        swiperElRef.current.update();
      }
    };

    // Initial reset
    resetSwiper();

    // Add resize observer to handle layout changes
    const resizeObserver = new ResizeObserver(() => {
      if (swiperElRef.current) {
        swiperElRef.current.update();
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (swiperElRef.current) {
        swiperElRef.current.destroy();
      }
    };
  }, []);

  // Handle Swiper initialization
  const handleSwiperInit = (swiper: SwiperType) => {
    swiperElRef.current = swiper;

    // Force reset to first slide
    requestAnimationFrame(() => {
      if (swiperElRef.current) {
        swiperElRef.current.slideTo(0, 0);
        swiperElRef.current.update();
      }
    });
  };

  if (!images.length) return null;

  // For single image, render without Swiper
  if (images.length === 1) {
    return (
      <div
        ref={containerRef}
        className="relative w-screen left-[50%] right-[50%] -translate-x-1/2"
      >
        <div className="flex justify-center items-center py-12">
          <div className="relative w-auto max-w-[85%]">
            <Image
              src={`/${images[0]}`}
              alt={`Photo of ${title ? title : slug}`}
              width={1000}
              height={1000}
              className="h-auto max-h-[25rem] md:max-h-[30rem] w-auto block cursor-zoom-in rounded-lg object-contain"
              priority
              loading="eager"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-screen left-[50%] right-[50%] -translate-x-1/2"
    >
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={"auto"}
        spaceBetween={-100}
        initialSlide={0}
        onSwiper={handleSwiperInit}
        updateOnWindowResize={true}
        observer={true}
        observeParents={true}
        resizeObserver={true}
        watchSlidesProgress={true}
        preventInteractionOnTransition={true}
        modules={[
          EffectCoverflow,
          Navigation,
          Pagination,
          Keyboard,
          Mousewheel,
        ]}
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
        className="overflow-visible !pb-12 py-12"
      >
        {images.map((image, index) => (
          <SwiperSlide
            key={`${image}-${index}`}
            className="w-auto max-w-[85%] transition-all duration-300 ease-in-out overflow-hidden origin-center opacity-[0.5] height-auto flex items-center justify-center"
          >
            <div className="relative w-auto overflow-hidden object-contain">
              <Image
                src={`/${image}`}
                alt={`Photo of ${title} number ${index + 1}`}
                width={1000}
                height={1000}
                className="w-full h-auto max-h-[25rem] md:max-h-[30rem] max-w-full block cursor-zoom-in rounded-lg"
                priority={index === 0}
                loading="eager"
              />
            </div>
          </SwiperSlide>
        ))}
        {images.length > 1 && (
          <>
            <div className="swiper-pagination"></div>
            <div className="swiper-button-prev"></div>
            <div className="swiper-button-next"></div>
          </>
        )}
      </Swiper>
    </div>
  );
}

export default memo(BlogPostImageGallery);
