"use client";

import type { GalleryItem } from "@/types/gallery";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/branding-photography.module.css";

const R2_URL = process.env.NEXT_PUBLIC_R2_URL;

type GalleryItemProps = {
  item: GalleryItem;
  index: number;
  onOpenGallery: (index: number) => void;
};

export default function GalleryItem({
  item,
  index,
  onOpenGallery,
}: GalleryItemProps) {
  return (
    <div
      className={`${styles.work_visual_item} relative group cursor-zoom-in`}
      onClick={() => onOpenGallery(index)}
    >
      <div className={styles.photo_item}>
        <Image
          src={`${R2_URL}/${item.images[0]}`}
          alt={`Photo ${index + 1}`}
          width={800}
          height={600}
          className="w-full h-auto transition-all duration-300 ease-in-out"
        />
        {item.images.length > 1 && (
          <Image
            src={`${R2_URL}/${item.images[1]}`}
            alt={`Photo ${index + 1} (hover)`}
            width={800}
            height={600}
            className="w-full h-full object-cover absolute top-0 left-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
          />
        )}
      </div>

      {item.storeLink && (
        <Link
          href={`/store/${item.storeLink}`}
          className={styles.store_link_button}
          onClick={(e) => e.stopPropagation()}
        >
          Buy
        </Link>
      )}

      {(item.description || item.logo) && (
        <div className={styles.work_visual_item_overlay}>
          <div className={styles.work_visual_item_overlay_content}>
            {item.description && (
              <p className={styles.work_visual_item_overlay_description}>
                {item.description}
              </p>
            )}
            {item.logo && (
              <Image
                src={`${R2_URL}/${item.logo}`}
                alt={`Photo ${index + 1} logo`}
                width={32}
                height={32}
                className={styles.work_visual_item_overlay_logo}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
