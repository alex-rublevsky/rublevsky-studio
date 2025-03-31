"use client";

import { useState } from "react";
import { brandingProjects } from "@/data/branding-projects";
import BrandingProjectCard from "./branding-project-card";
import styles from "../gallery/branding-photography.module.css";
import {
  Drawer,
  DrawerContent,
  DrawerBody,
} from "@/components/ui/shared/drawer";
import Image from "next/image";
import ImageGallery from "@/components/ui/shared/ImageGallery";

export default function BrandingSection() {
  const [selectedProject, setSelectedProject] = useState(brandingProjects[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleProjectClick = (project: (typeof brandingProjects)[0]) => {
    setSelectedProject(project);
    setIsDrawerOpen(true);
  };

  return (
    <section id="branding">
      <h1
        className={`text-center work_page_section_title_holder`}
        data-heading-reveal
      >
        Branding
      </h1>

      <div className={styles.column_layout}>
        {brandingProjects.map((project, index) => (
          <div
            key={index}
            onClick={() => handleProjectClick(project)}
            className="cursor-pointer"
          >
            <BrandingProjectCard project={project} />
          </div>
        ))}
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="" width="full">
          <DrawerBody className="p-0">
            <div className="min-h-full flex flex-col lg:flex-row gap-0 lg:gap-10 items-start">
              {/* Left column - Gallery */}
              <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col lg:flex-row gap-2 lg:h-full self-start">
                {selectedProject.type === "image" && selectedProject.images ? (
                  <div className="w-full">
                    <ImageGallery
                      images={selectedProject.images}
                      alt={selectedProject.name}
                      size="compact"
                    />
                  </div>
                ) : selectedProject.type === "video" && selectedProject.src ? (
                  <div className="relative aspect-4/3 w-full">
                    <video
                      src={`/${selectedProject.src}`}
                      className="w-full h-full rounded-none lg:rounded-lg"
                      controls
                      autoPlay={false}
                      loop
                      muted
                      playsInline
                    />
                  </div>
                ) : null}
              </div>

              {/* Right column - Project Information */}
              <div className="w-full lg:w-2/5 xl:w-1/3 px-4 lg:px-0 mt-4 lg:mt-0">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">{selectedProject.name}</h3>

                  {selectedProject.description && (
                    <div className="prose prose-sm dark:prose-invert">
                      <p className="text-lg">{selectedProject.description}</p>
                    </div>
                  )}

                  {selectedProject.logo && (
                    <div className="flex items-center justify-start">
                      <Image
                        src={`/${selectedProject.logo}`}
                        alt={`${selectedProject.name} logo`}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </section>
  );
}
