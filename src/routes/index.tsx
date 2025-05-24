import { createFileRoute } from "@tanstack/react-router";
import HeroSection from "~/components/ui/studio/HeroSection";
import MembershipBenefitsSection from "~/components/ui/studio/MembershipBenefitsSection";
import SubscriptionSection from "~/components/ui/studio/SubscriptionSection";

import TestimonialsSection from "~/components/ui/studio/testimonial/TestimonialSection";
import FaqSection from "~/components/ui/studio/FaqSection";
import ServicesOffered from "~/components/ui/studio/ServicesSection";
import { SkillsSection } from "~/components/ui/studio/SkillsSection";
import ExperienceTimelineSection from "~/components/ui/studio/ExperienceTimelineSection";
import WebProjectsSection from "~/components/ui/studio/web/WebSection";
import BrandingSection from "~/components/ui/studio/branding/BrandingSection";
import GallerySection from "~/components/ui/studio/gallery/GallerySection";
import CallBookingSection from "~/components/ui/studio/CallBookingSection";
import SmoothScroll from "~/components/SmoothScroll";

export const Route = createFileRoute("/")({
  component: Work,
});

function Work() {
  return (
    <SmoothScroll>
      <div className="[view-transition-name:main-content]">
        <HeroSection />
        <MembershipBenefitsSection />
        <SubscriptionSection />
        <TestimonialsSection />
        <FaqSection />
        <ServicesOffered />
        <SkillsSection />
        <ExperienceTimelineSection />
        <WebProjectsSection />
        <BrandingSection />
        <GallerySection type="photos" />
        <GallerySection type="posters" />
        <CallBookingSection />
      </div>
    </SmoothScroll>
  );
}
