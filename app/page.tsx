import SplineHero from "@/components/ui/spline-hero";
import BrandingSection from "@/components/ui/branding/branding-section";
import WebProjectsSection from "@/components/ui/web-projects/webProjectsSection";
import GallerySection from "@/components/ui/gallery/gallery-section";
import { webProjects } from "@/data/web-projects";
import { photos } from "@/data/photography";
import { posters } from "@/data/posters";
import GreetingsSection from "@/components/ui/greetingsSection";
import { SkillsSection } from "@/components/ui/skills-section";
import { ExperienceTimeline } from "@/components/ui/experience-timeline";
import Link from "next/link";

const CVButton = () => {
  return (
    <div className="fixed bottom-2 right-2 md:right-8 z-50">
      <div className="relative flex w-fit rounded-full border border-black bg-white hover:bg-black hover:text-white transition-all duration-300 p-[0.3rem]">
        <Link href="https://assets.rublevsky.studio/PDF/Resume%20Alexander%20Rublevsky.pdf">
          <li className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-4 md:py-2 md:text-sm">
            CV
          </li>
        </Link>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <>
      <CVButton />
      {/* <SplineHero /> */}
      <GreetingsSection />
      <SkillsSection />
      <ExperienceTimeline />
      <WebProjectsSection projects={webProjects} />
      <BrandingSection />
      <GallerySection type="photos" items={photos} />
      <GallerySection type="posters" items={posters} />
    </>
  );
}
