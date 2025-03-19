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

        {/* Personal website info */}
        <div className="mb-0">
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:gap-y-6">
            <div className="col-span-12 flex justify-center items-center">
              <div className="mx-auto text-center">
                <h2 className="large-text-description">
                  Rublevsky Studio was created using{" "}
                  <strong className="font-semibold">Next.js</strong>,{" "}
                  <strong className="font-semibold">React</strong>, and{" "}
                  <strong className="font-semibold">Tailwind</strong>
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
