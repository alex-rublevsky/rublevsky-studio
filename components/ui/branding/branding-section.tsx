"use client";

import { useState } from "react";
import { brandingProjects } from "@/data/branding-projects";
import BrandingProjectCard from "./branding-project-card";
import styles from "@/styles/branding-photography.module.css";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
} from "@/components/ui/drawer";
import Image from "next/image";

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
        className={`text-center ${styles.work_page_section_title_holder}`}
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
        <DrawerContent className="h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>{selectedProject.name}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Gallery Section */}
              <div className="space-y-4">
                {selectedProject.type === "image" && selectedProject.images ? (
                  selectedProject.images.map((image, index) => (
                    <div key={index} className="relative aspect-[4/3]">
                      <Image
                        src={`/${image}`}
                        alt={`${selectedProject.name} ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))
                ) : selectedProject.type === "video" && selectedProject.src ? (
                  <div className="relative aspect-[4/3]">
                    <video
                      src={`/${selectedProject.src}`}
                      className="w-full h-full rounded-lg"
                      controls
                      autoPlay={false}
                      loop
                      muted
                      playsInline
                    />
                  </div>
                ) : null}
              </div>

              {/* Description Section */}
              <div className="space-y-6">
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
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </section>
  );
}
