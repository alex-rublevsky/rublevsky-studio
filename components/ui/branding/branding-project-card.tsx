"use client";

import { BrandingProject } from "@/types/branding-project";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/branding-photography.module.css";

type BrandingProjectCardProps = {
  project: BrandingProject;
};

export default function BrandingProjectCard({
  project,
}: BrandingProjectCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (project.type === "video" && videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {
          // Handle any play() errors silently
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, project.type]);

  useEffect(() => {
    if (project.type === "image" && project.images && isHovered) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === project.images!.length - 1 ? 0 : prevIndex + 1
        );
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isHovered, project.type, project.images]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  return (
    <div
      className={styles.work_visual_item}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.branding_item}>
        {project.type === "image" ? (
          <div>
            <Image
              src={`/${project.images![0]}`}
              alt={project.name}
              width={800}
              height={600}
              className="w-full h-auto transition-opacity duration-800 ease-in-out"
              style={{ opacity: isHovered ? 0 : 1 }}
            />
            {project.images!.map((image, index) => (
              <Image
                key={index}
                src={`/${image}`}
                alt={`${project.name} ${index + 1}`}
                width={800}
                height={600}
                className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-800 ease-in-out"
                style={{
                  opacity: isHovered && currentImageIndex === index ? 1 : 0,
                }}
              />
            ))}
          </div>
        ) : (
          <div className={styles.video_container}>
            <Image
              src={`/${project.preview}`}
              alt={project.name}
              width={800}
              height={600}
              className="w-full h-auto transition-opacity duration-800 ease-in-out"
              style={{ opacity: isHovered ? 0 : 1 }}
            />
            <video
              ref={videoRef}
              src={`/${project.src}`}
              className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-800 ease-in-out"
              style={{ opacity: isHovered ? 1 : 0 }}
              autoPlay={isHovered}
              loop
              muted
              playsInline
            />
          </div>
        )}
      </div>

      {(project.description || project.logo) && (
        <div className={styles.work_visual_item_overlay}>
          <div className={styles.work_visual_item_overlay_content}>
            {project.description && (
              <p className={styles.work_visual_item_overlay_description}>
                {project.description}
              </p>
            )}
            {project.logo && (
              <Image
                src={`/${project.logo}`}
                alt={`${project.name} logo`}
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
