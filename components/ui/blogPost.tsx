"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectCoverflow,
  Navigation,
  Pagination,
  Keyboard,
  Mousewheel,
} from "swiper/modules";
import { useState, useEffect, useRef } from "react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/keyboard";
import "swiper/css/mousewheel";

interface BlogPostProps {
  id: string;
  title: string;
  body: string;
  images: string[];
  publishedAt: string;
}

function BlogPost({ id, title, body, images, publishedAt }: BlogPostProps) {
  const [isReady, setIsReady] = useState(false);

  return (
    <article className="max-w-2xl mx-auto">
      <div
        className="relative left-[50%] right-[50%] w-screen -translate-x-1/2 mb-4 overflow-x-hidden"
        style={{
          opacity: isReady ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          spaceBetween={-100}
          threshold={0}
          initialSlide={0}
          onAfterInit={() => setIsReady(true)}
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
                  src={image}
                  alt={title}
                  width={1000}
                  height={1000}
                  className="w-auto h-full max-h-[25rem] md:max-h-[30rem] max-w-full block cursor-zoom-in rounded-lg"
                  priority={index === 0}
                />
              </div>
            </SwiperSlide>
          ))}
          <div className="swiper-pagination"></div>
          <div className="swiper-button-prev"></div>
          <div className="swiper-button-next"></div>
        </Swiper>
      </div>

      <style jsx global>{`
        .swiper {
          opacity: ${isReady ? "1" : "0"};
          transition: opacity 0.5s ease-in-out;
        }

        .swiper-slide {
          width: auto;
          max-width: 88%;
          transition: all 0.3s;
          overflow: hidden;
          transform-origin: center;
          opacity: 0.4;
          transition: all 0.3s ease;
          height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .swiper-slide::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          box-shadow: 0 0 0 100vmax currentColor;
          color: white;
        }

        .swiper-slide-active {
          opacity: 1 !important;
          z-index: 1;
          transform: scale(1.05);
        }

        .swiper-pagination {
          position: absolute !important;
          bottom: 0 !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          z-index: 10 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          width: auto !important;
          padding: 0.5rem 1rem !important;
        }

        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #000;
          opacity: 0.3;
          margin: 0 5px;
          transition: opacity 0.3s ease;
        }

        .swiper-pagination-bullet-active {
          opacity: 1;
        }

        .swiper-button-prev,
        .swiper-button-next {
          width: 3.5rem !important;
          height: 3.5rem !important;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          color: #000 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
        }

        .swiper-button-prev:hover,
        .swiper-button-next:hover {
          background: #f3f3f3;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: scale(1.05);
        }

        .swiper-button-prev:active,
        .swiper-button-next:active {
          background: #e8e8e8;
          transform: scale(0.95);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .swiper-button-prev:after,
        .swiper-button-next:after {
          font-size: 1.1rem !important;
          font-weight: bold;
          transition: color 0.3s ease !important;
        }

        .swiper-button-prev:hover:after,
        .swiper-button-next:hover:after {
          color: #333 !important;
        }

        .swiper-button-prev:active:after,
        .swiper-button-next:active:after {
          color: #666 !important;
        }

        .swiper-wrapper {
          align-items: center;
        }

        @media (max-width: 768px) {
          .swiper-slide {
            max-width: 81%;
          }
        }
      `}</style>
      <div className="sticky top-0">
        <h3>{title}</h3>
      </div>
      <p className="whitespace-pre-line">{body}</p>
    </article>
  );
}

export default BlogPost;
