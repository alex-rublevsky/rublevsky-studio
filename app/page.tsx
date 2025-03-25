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

export default function Home() {
  return (
    <>
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
