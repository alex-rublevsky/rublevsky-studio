"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import Image from "next/image";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/mousewheel";
import "../blog/sliders.css";
import NeumorphismCard from "../shared/neumorphism-card";
const testimonials = [
  {
    id: 1,
    name: "Roman Galavura",
    role: "CEO at BeautyFloor",
    content:
      "We initially faced challenges with our website's design and were unhappy with its look. We contacted Alexander for a redesign, and he exceeded our expectations. As the lead designer, he led the project with a developer he helped us to find, ensuring our vision was realized.",
    avatar: "/roman.jpg",
    link: "https://www.instagram.com/beautyfloor_vl/",
  },
  {
    id: 2,
    name: "Diana Egorova",
    role: "CEO at InkSoul",
    content:
      "In our interaction I liked Alexander's attentiveness to my requests, detailed analysis of my activity and his desire to find unusual and yet functional design solutions, suitable for the specifics of my work.",
    avatar: "/diana.jpg",
    link: "https://www.instagram.com/diana_inksoul/",
  },
  {
    id: 3,
    name: "Kristina",
    role: "Street Artist",
    content:
      "I reached out to Alexander to help expand my personal brand, and he assisted with creating merchandise, including clothing, stickers, and posters. I really appreciated his creativity and straightforward approach to the task.",
    avatar: "/kristina-testimonial.jpg",
    link: "https://www.instagram.com/abalych",
  },
  {
    id: 4,
    name: "Brighton",
    role: "Music Artist",
    content:
      "Alexander did an outstanding job with pre-press editing and large-format printing of posters that brilliantly showcase my artistic vision. His attention to detail and expertise brought my ideas to life, delivering mind-blowing quality that was absolutely top-notch. Everything was fabulous—from the prints themselves to the entire experience—which has helped elevate my brand presence and supported my music journey immensely.",
    avatar: "/brighton.jpg",
    link: "https://on.soundcloud.com/yBk5X3a4cWA4xnWdA",
  },
];

function TestimonialsSection() {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section id="testimonials" className="no-padding">
      <h1 className="text-center work-page-section-title-holder">
        Testimonials
      </h1>

      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        slidesPerView="auto"
        spaceBetween={0}
        centeredSlides={true}
        loop={false}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        mousewheel={{
          forceToAxis: true,
          sensitivity: 0.01,
          releaseOnEdges: true,
          thresholdDelta: 5,
        }}
        modules={[Pagination, Navigation, Autoplay, Mousewheel]}
        className="tinyflow-slider cursor-grab"
        data-rotate="5"
        data-speed="500"
      >
        {testimonials.map((testimonial) => (
          <SwiperSlide key={testimonial.id} className="tinyflow-slide !w-auto">
            <NeumorphismCard className=" m-10">
              <div className="testimonial-card">
                <p className="mb-6">"{testimonial.content}"</p>
                <a
                  href={testimonial.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center group transition-transform duration-300 ease-in-out transform hover:translate-y-[-5px]"
                >
                  <div className="w-12 h-12 rounded-full mr-4 relative overflow-hidden">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold group-hover:underline">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </a>
              </div>
            </NeumorphismCard>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default TestimonialsSection;
