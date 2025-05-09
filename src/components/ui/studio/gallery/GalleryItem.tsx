import type { GalleryItem } from "./galleryTypes.ts";
import { Button } from "~/components/ui/shared/Button";
import { Link } from "@tanstack/react-router";
import { Image } from "~/components/ui/shared/Image";

import { motion } from "motion/react";
//import styles from "./branding-photography.module.css";

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
    <motion.div
      //shadow-[0_5px_6px_rgb(0,0,0,0.08)]

      className="relative group transform-gpu rounded-lg overflow-hidden cursor-pointer mb-3"
      onClick={() => onOpenGallery(index)}
      whileHover={{
        scale: 1.025,
      }}
      transition={{
        duration: 0.25,
        ease: "easeInOut",
      }}
    >
      {/* TODO: does this solve the problem on ios which needed custom css in branding-photography module? */}
      <div>
        <Image
          src={`/${item.images[0]}`}
          alt={`Photo ${index + 1}`}
          width={800}
          height={600}
          className="w-full h-auto transition-all duration-300 ease-in-out"
          loading="eager"
          //priority={true}
        />
        {item.images.length > 1 && (
          <Image
            src={`/${item.images[1]}`}
            alt={`Photo ${index + 1} (hover)`}
            width={800}
            height={600}
            className="w-full h-full object-cover absolute top-0 left-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
            loading="eager"
            // priority={true}
          />
        )}
      </div>

      {item.storeLink && (
        <Button
          asChild
          variant="default"
          size="lg"
          className="group-hover:opacity-100 opacity-0 backdrop-blur-md hover:bg-background/20 absolute top-2 right-2 transition-all duration-300 ease-in-out"
        >
          <Link
            //to={`/store/$item.storeLink`}
            to="/store/$itemId"
            params={{
              itemId: item.storeLink,
            }}
          >
            Buy
          </Link>
        </Button>
      )}

      {(item.description || item.logo) && (
        <div className="absolute inset-0 mt-auto col-start-1 row-start-1 self-end w-full p-2 pointer-events-none">
          <div className="py-4 px-2 bg-background/70 backdrop-blur-sm flex justify-between items-center opacity-0 transition-opacity duration-400 ease-in-out group-hover:opacity-100 rounded-md z-10">
            <div className="flex space-between items-center w-full">
              {item.description && (
                <p className="text-sm text-gray-800 flex-grow mr-2">
                  {item.description}
                </p>
              )}
              {item.logo && (
                <Image
                  src={`/${item.logo}`}
                  alt={`Photo ${index + 1} logo`}
                  width={64}
                  height={64}
                  className="h-7 flex-shrink-0 box-shadow-none"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
