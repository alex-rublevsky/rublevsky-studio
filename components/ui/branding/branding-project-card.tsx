"use client";

import { BrandingProject } from "@/types/branding-project";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/branding-photography.module.css";

const R2_URL = process.env.NEXT_PUBLIC_R2_URL;

type BrandingProjectCardProps = {
  project: BrandingProject;
};

export default function BrandingProjectCard({
  project,
}: BrandingProjectCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (
      isHovered &&
      project.type === "image" &&
      project.images &&
      project.images.length > 1
    ) {
      // Start with second image
      setCurrentImageIndex(1);

      // Set up the interval
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % project.images!.length);
      }, 800);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setCurrentImageIndex(0);
    };
  }, [isHovered, project]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (project.type === "video" && videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (project.type === "video" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
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
              src={`${R2_URL}/${project.images![0]}`}
              alt={project.name}
              width={800}
              height={600}
              className="w-full h-auto transition-opacity duration-800 ease-in-out"
              style={{ opacity: isHovered ? 0 : 1 }}
            />
            {project.images!.map((image, index) => (
              <Image
                key={index}
                src={`${R2_URL}/${image}`}
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
              src={`${R2_URL}/${project.preview}`}
              alt={project.name}
              width={800}
              height={600}
              className="w-full h-auto transition-opacity duration-800 ease-in-out"
              style={{ opacity: isHovered ? 0 : 1 }}
            />
            <video
              ref={videoRef}
              src={`${R2_URL}/${project.src}`}
              className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-800 ease-in-out"
              style={{ opacity: isHovered ? 1 : 0 }}
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
                src={`${R2_URL}/${project.logo}`}
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
