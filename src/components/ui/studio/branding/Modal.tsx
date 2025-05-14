import { motion } from "motion/react";
import { BrandingProject } from "./brandingTypes";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../shared/Button";
import { X } from "lucide-react";
import { Image } from "~/components/ui/shared/Image";
//import { unstable_ViewTransition as ViewTransition } from "react";

export default function Modal({
  selected,
  setSelected,
}: {
  selected: BrandingProject | null;
  setSelected: (project: BrandingProject | null) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<
    string | null
  >(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
      setSelectedGalleryImage(null);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selected]);

  if (!selected || !mounted) {
    return null;
  }

  // The displayed image is either the selected gallery image or the first image (maintaining layout animation)
  const displayedImage =
    selected.type === "image"
      ? selectedGalleryImage || selected.images![0]
      : null;

  const modal = (
    <div
      className="p-2 lg:p-4 not-first:fixed inset-0 h-auto z-50 cursor-pointer flex items-center justify-center bg-primary/70 backdrop-blur-xl"
      onClick={() => setSelected(null)}
    >
      <div
        className="h-full w-full max-w-7xl cursor-default overflow-y-auto overflow-x-hidden scrollbar-none bg-background lg:p-4 rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex flex-col lg:flex-row h-auto gap-2">
          {/* Thumbnails column - desktop only */}
          {selected.type === "image" &&
            selected.images &&
            selected.images.length > 1 && (
              <div className="hidden lg:block shrink-0 w-24 overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {selected.images.map((image, index) => (
                    <div
                      key={index}
                      className="shrink-0 w-24 h-24 relative cursor-pointer"
                      onMouseEnter={() => setSelectedGalleryImage(image)}
                    >
                      <div
                        className={`
                        absolute inset-0
                        rounded-md
                        ${displayedImage === image ? "border-2 border-black" : "border border-transparent"}
                        transition-colors duration-200
                      `}
                      />
                      <div className="absolute inset-[2px] rounded-[6px] overflow-hidden">
                        <img
                          src={`https://assets.rublevsky.studio/${image}`}
                          alt={`${selected.name} thumbnail ${index + 1}`}
                          //fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Main image container */}
          <div className="flex items-center  justify-center lg:items-start lg:justify-start lg:grow relative pl-4 lg:pl-0 pr-4 lg:pr-0 pt-4 lg:pt-0">
            {selected.type === "image" ? (
              <div className="relative  w-full lg:w-auto lg:h-[60vh] flex items-center lg:items-start justify-center">
                {/* <ViewTransition key={displayedImage}> */}
                <img
                  //layoutId={`card-${selected.id}`}
                  //transition={{ duration: 0.3 }}
                  //style={{ viewTransitionName: `branding-image` }}
                  src={`https://assets.rublevsky.studio/${displayedImage}`}
                  alt={selected.name}
                  width={1000}
                  height={1000}
                  className="w-auto h-auto max-w-full max-h-[60dvh] lg:max-h-[calc(100vh-4rem)] object-contain rounded-lg relative z-2 [view-transition-name:branding-image]"
                />
                {/* </ViewTransition> */}
              </div>
            ) : (
              <motion.video
                layoutId={`card-video-${selected.id}`}
                src={`https://assets.rublevsky.studio/${selected.src}`}
                className="w-full h-full overflow-hidden rounded-lg object-contain"
                muted
                autoPlay={true}
                loop={true}
              />
            )}
          </div>

          {/* Mobile thumbnails */}
          {selected.type === "image" &&
            selected.images &&
            selected.images.length > 1 && (
              <div className="mt-1 lg:hidden">
                <div className="overflow-x-auto scrollbar-none">
                  <div className="flex gap-2 px-4 pb-2">
                    {selected.images.map((image, index) => (
                      <div
                        key={index}
                        className="shrink-0 w-24 h-24 relative cursor-pointer"
                        onMouseEnter={() => setSelectedGalleryImage(image)}
                      >
                        <div
                          className={`
                            absolute inset-0
                            rounded-md
                            ${displayedImage === image ? "border-2 border-black" : "border border-transparent"}
                            transition-colors duration-200
                          `}
                        />
                        <div className="absolute inset-[2px] rounded-[6px] overflow-hidden">
                          <Image
                            src={`https://assets.rublevsky.studio/${image}`}
                            alt={`${selected.name} thumbnail ${index + 1}`}
                            //fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {/* Details column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:w-[37ch] lg:pl-6 pt-4 lg:pt-18 pb-20 lg:pb-0 shrink-0 overflow-y-auto mx-4 lg:mx-0 flex flex-col"
          >
            <div>
              <h3 className="text-2xl font-bold">{selected.name}</h3>

              {selected.description && (
                <div className="prose prose-sm dark:prose-invert mt-2 ">
                  <p className="text-lg">{selected.description}</p>
                </div>
              )}

              {selected.logo && (
                <div className="flex items-center justify-start mt-4">
                  <Image
                    src={`/${selected.logo}`}
                    alt={`${selected.name} logo`}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={() => setSelected(null)}
              size="lg"
              className="flex absolute right-4 top-4 z-30"
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close gallery</span>
            </Button>

            <Button
              onClick={() => setSelected(null)}
              size="lg"
              className="mt-auto w-auto fixed bottom-4 left-4 right-4 lg:hidden z-30 rounded-lg"
            >
              Back to gallery
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
