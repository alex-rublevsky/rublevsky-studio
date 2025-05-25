"use client";

import { Project } from "./webTypes";
import WebProjectCard from "./WebEntry";

import { webProjects } from "~/data/webProjects";

export default function WebProjectsSection() {
  return (
    <section id="web" className="w-full">
      <div>
        <h1
          className="text-center work_page_section_title_holder"
          data-heading-reveal
        >
          Web
        </h1>

        {webProjects.map((project) => (
          <WebProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
