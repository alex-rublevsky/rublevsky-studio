"use client";

import { Project } from "@/types/web-project";
import WebProjectCard from "./webProjectEntry";

type WebProjectsSectionProps = {
  projects: Project[];
};

export default function WebProjectsSection({
  projects,
}: WebProjectsSectionProps) {
  return (
    <section id="web" className="w-full">
      <div>
        <h1
          className="text-center work_page_section_title_holder"
          data-heading-reveal
        >
          Web
        </h1>

        {projects.map((project, index) => (
          <WebProjectCard key={index} project={project} />
        ))}
      </div>
    </section>
  );
}
