import HeroSection from "@/components/ui/studio/heroSection";
import MembershipBenefitsSection from "@/components/ui/studio/membershipBenefitsSection";
import { webProjects } from "@/data/web-projects";
import { photos } from "@/data/photography";
import { posters } from "@/data/posters";
import TestimonialsSection from "@/components/ui/studio/testimonialSliderSection";
import SubscriptionSection from "@/components/ui/studio/subscriptionSection";
import FaqSection from "@/components/ui/studio/faqSection";
import { ServicesOffered } from "@/components/ui/studio/servicesSection";
import { SkillsSection } from "@/components/ui/studio/skillsSection";
import { ExperienceTimeline } from "@/components/ui/studio/experienceTimeline";
import WebProjectsSection from "@/components/ui/studio/web-projects/webProjectsSection";
import BrandingSection from "@/components/ui/studio/branding/branding-section";
import GallerySection from "@/components/ui/studio/gallery/gallerySection";
import CallBookingSection from "@/components/ui/studio/callBookingSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <MembershipBenefitsSection />
      <SubscriptionSection />
      <TestimonialsSection />
      <FaqSection />
      <ServicesOffered />
      <SkillsSection />
      <ExperienceTimeline />
      <WebProjectsSection projects={webProjects} />
      <BrandingSection />
      <GallerySection type="photos" items={photos} />
      <GallerySection type="posters" items={posters} />
      <CallBookingSection />
    </>
  );
}
