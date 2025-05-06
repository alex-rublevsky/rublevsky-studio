import { createFileRoute } from "@tanstack/react-router";
import HeroSection from "~/components/ui/studio/HeroSection";
import MembershipBenefitsSection from "~/components/ui/studio/MembershipBenefitsSection";
import SubscriptionSection from "~/components/ui/studio/SubscriptionSection";

// import { webProjects } from "@/data/web-projects";
// import { photos } from "@/data/photography";
// import { posters } from "@/data/posters";
// import TestimonialsSection from "@/components/ui/studio/testimonialSliderSection";
// import FaqSection from "@/components/ui/studio/faqSection";
// import { ServicesOffered } from "@/components/ui/studio/servicesSection";
// import { SkillsSection } from "@/components/ui/studio/skillsSection";
// import { ExperienceTimeline } from "@/components/ui/studio/experienceTimeline";
// import WebProjectsSection from "@/components/ui/studio/web-projects/webProjectsSection";
// import BrandingSection from "@/components/ui/studio/branding/branding-section";
// import GallerySection from "@/components/ui/studio/gallery/gallerySection";
// import CallBookingSection from "@/components/ui/studio/callBookingSection";

export const Route = createFileRoute("/")({
  component: Work,
});

function Work() {
  return (
    <>
      <HeroSection />
      <MembershipBenefitsSection />
      <SubscriptionSection />
      {/*  <TestimonialsSection />
      <FaqSection />
      <ServicesOffered />
      <SkillsSection />
      <ExperienceTimeline />
      <WebProjectsSection projects={webProjects} />
      <BrandingSection />
      <GallerySection type="photos" items={photos} />
      <GallerySection type="posters" items={posters} />
      <CallBookingSection /> */}
    </>
  );
}
