import SplineHero from "@/components/ui/spline-hero";
import BrandingSection from "@/components/ui/branding/branding-section";
import WebProjectsSection from "@/components/ui/web-projects/web-projects-section";
import GallerySection from "@/components/ui/gallery/gallery-section";
import { webProjects } from "@/data/web-projects";
import { photos } from "@/data/photography";
import { posters } from "@/data/posters";

export default function Home() {
  return (
    <main>
      <SplineHero />
      <WebProjectsSection projects={webProjects} />
      <BrandingSection />
      <GallerySection type="photos" items={photos} />
      <GallerySection type="posters" items={posters} />
    </main>
  );
}
