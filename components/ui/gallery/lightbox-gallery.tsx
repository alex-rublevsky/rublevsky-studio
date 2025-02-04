"use client";

import { useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

const R2_URL = process.env.NEXT_PUBLIC_R2_URL;

type LightboxGalleryProps = {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentImage?: string;
};

export default function LightboxGallery({
  isOpen,
  onClose,
  onNext,
  onPrev,
  currentImage,
}: LightboxGalleryProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          onNext();
          break;
        case "ArrowLeft":
          onPrev();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !currentImage || typeof window === "undefined") return null;

  const content = (
    <div
      className="fixed inset-0 isolate bg-black/90 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
      >
        ×
      </button>
      <button
        onClick={onPrev}
        className="absolute left-4 text-white text-4xl hover:text-gray-300"
      >
        ‹
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 text-white text-4xl hover:text-gray-300"
      >
        ›
      </button>
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4">
        <Image
          src={`${R2_URL}/${currentImage}`}
          alt="Gallery image"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
