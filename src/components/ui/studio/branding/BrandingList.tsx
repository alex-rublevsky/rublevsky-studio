import { brandingProjects } from "~/data/brandingProjects";
import { Image } from "~/components/ui/shared/Image";
//import { unstable_ViewTransition as ViewTransition } from "react";
import { motion } from "motion/react";
import { BrandingProject } from "./brandingTypes";
import { Link } from "@tanstack/react-router";

type BrandingProjectCardProps = {
  project: BrandingProject;
};

const BrandingProjectCard = ({ project }: BrandingProjectCardProps) => {
  return (
    <div
      // whileHover={{
      //   scale: 1.025,
      //   transition: {
      //     duration: 0.25,
      //     ease: "easeInOut",
      //   },
      // }}
      className="w-full mb-2 group grid grid-cols-1 grid-rows-1 "
    >
      {project.type === "image" ? (
        // <ViewTransition key={project.images![0]}>
        <Link
          to={`/branding/$brandingId`}
          params={{ brandingId: project.id.toString() }}
          className="col-start-1 row-start-1 z-10 relative"
        >
          <Image
            //style={{ viewTransitionName: `branding-image` }}
            //viewTransition={{ types: ["slide-left"] }}
            //whileTap={{ scale: 0.95 }}
            //layoutId={`card-${project.id}`}
            src={`/${project.images![0]}`}
            alt={project.name}
            width={800}
            height={600}
            className={`w-full rounded-lg cursor-pointer`}
            loading="eager"
            style={{
              viewTransitionName: `branding-image-${project.images![0]}`,
            }}
          />
        </Link>
      ) : (
        //</ViewTransition>
        <video
          // layoutId={`card-video-${project.id}`}
          // whileHover={{
          //   scale: 1.025,
          //   transition: {
          //     duration: 0.25,
          //     ease: "easeInOut",
          //   },
          // }}
          // whileTap={{ scale: 0.95 }}
          src={`https://assets.rublevsky.studio/${project.src}`}
          className="overflow-hidden rounded-lg cursor-pointer w-full h-auto col-start-1 row-start-1"
          muted
          autoPlay={true}
          loop={true}
          onClick={() => {}}
        />
      )}

      {(project.description || project.logo) && (
        <div className="col-start-1 row-start-1 self-end w-full p-2 pointer-events-none z-20">
          <div className="py-4 px-2 bg-background/70 backdrop-blur-sm flex justify-between items-center opacity-0 transition-opacity duration-400 ease-in-out group-hover:opacity-100 rounded-md">
            <div className="flex space-between items-center w-full">
              {project.description && (
                <p className="text-sm text-gray-800 flex-grow mr-2">
                  {project.description}
                </p>
              )}
              {project.logo && (
                <Image
                  src={`/${project.logo}`}
                  alt={`${project.name} logo`}
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
    </div>
  );
};

export default function BrandingList() {
  return (
    <div className="columns-2 md:columns-3 2xl:columns-4 gap-3">
      {brandingProjects.map((project, index) => (
        <BrandingProjectCard key={index} project={project} />
      ))}
    </div>
  );
}
