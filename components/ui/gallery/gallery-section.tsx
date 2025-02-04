"use client";

import { GalleryItem, GalleryType } from "@/types/gallery";
import styles from "@/styles/branding-photography.module.css";
import GalleryItemComponent from "./gallery-item";
import { useState } from "react";
import LightboxGallery from "./lightbox-gallery";

type GallerySectionProps = {
  type: GalleryType;
  items: GalleryItem[];
};

export default function GallerySection({ type, items }: GallerySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openGallery = (index: number) => {
    setCurrentIndex(index);
    setCurrentImageIndex(0);
    setIsOpen(true);
  };

  const closeGallery = () => {
    setIsOpen(false);
  };

  const nextImage = () => {
    if (currentImageIndex < items[currentIndex].images.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    } else {
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setCurrentImageIndex(0);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    } else {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      setCurrentImageIndex(items[currentIndex].images.length - 1);
    }
  };

  return (
    <section id={type}>
      <h1
        className={`text-center ${styles.work_page_section_title_holder}`}
        data-heading-reveal
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </h1>

      <div className={styles.column_layout}>
        {items.map((item, index) => (
          <GalleryItemComponent
            key={index}
            item={item}
            index={index}
            onOpenGallery={openGallery}
          />
        ))}
      </div>

      <LightboxGallery
        isOpen={isOpen}
        onClose={closeGallery}
        onNext={nextImage}
        onPrev={prevImage}
        currentImage={items[currentIndex]?.images[currentImageIndex]}
      />
    </section>
  );
}
