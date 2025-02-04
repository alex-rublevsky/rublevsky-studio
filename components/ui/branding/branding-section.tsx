"use client";

import { brandingProjects } from "@/data/branding-projects";
import BrandingProjectCard from "./branding-project-card";
import styles from "@/styles/branding-photography.module.css";

export default function BrandingSection() {
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
          <BrandingProjectCard key={index} project={project} />
        ))}
      </div>
    </section>
  );
}
