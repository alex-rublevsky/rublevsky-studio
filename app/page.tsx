import SplineHero from "@/components/ui/spline-hero";
import BrandingSection from "@/components/ui/branding/branding-section";
import WebProjectsSection from "@/components/ui/web-projects/webProjectsSection";
import GallerySection from "@/components/ui/gallery/gallery-section";
import { webProjects } from "@/data/web-projects";
import { photos } from "@/data/photography";
import { posters } from "@/data/posters";
import GreetingsSection from "@/components/ui/greetingsSection";
import { ExpertiseSection } from "@/components/ui/expertise-section";
import { ExperienceTimeline } from "@/components/ui/experience-timeline";
export default function Home() {
  return (
    <main>
      {/* <SplineHero /> */}
      <GreetingsSection />
      <ExpertiseSection />
      <ExperienceTimeline />
      <WebProjectsSection projects={webProjects} />
      <BrandingSection />
      <GallerySection type="photos" items={photos} />
      <GallerySection type="posters" items={posters} />
    </main>
  );
}
