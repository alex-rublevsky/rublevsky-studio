import dynamic from "next/dynamic";
import HeroSection from "@/components/ui/studio/heroSection";
import MembershipBenefitsSection from "@/components/ui/studio/membership-benefits-section";
import { webProjects } from "@/data/web-projects";
import { photos } from "@/data/photography";
import { posters } from "@/data/posters";

// Dynamically import below-the-fold components
const SubscriptionSection = dynamic(
  () => import("@/components/ui/studio/subscription-section"),
  { ssr: true, loading: () => <LoadingSpinner /> }
);
const TestimonialsSection = dynamic(
  () => import("@/components/ui/studio/testimonials-section"),
  { ssr: true, loading: () => <LoadingSpinner /> }
);
const FaqSection = dynamic(() => import("@/components/ui/studio/faq-section"), {
  ssr: true,
  loading: () => <LoadingSpinner />,
});
const ServicesOffered = dynamic(
  () =>
    import("@/components/ui/studio/services-offered").then(
      (mod) => mod.ServicesOffered
    ),
  { ssr: true, loading: () => <LoadingSpinner /> }
);
const SkillsSection = dynamic(
  () =>
    import("@/components/ui/studio/skills-section").then(
      (mod) => mod.SkillsSection
    ),
  { ssr: true, loading: () => <LoadingSpinner /> }
);
const ExperienceTimeline = dynamic(
  () =>
    import("@/components/ui/studio/experience-timeline").then(
      (mod) => mod.ExperienceTimeline
    ),
  { ssr: true, loading: () => <LoadingSpinner /> }
);
const WebProjectsSection = dynamic(
  () => import("@/components/ui/web-projects/webProjectsSection"),
  { ssr: true, loading: () => <LoadingSpinner /> }
);
const BrandingSection = dynamic(
  () => import("@/components/ui/branding/branding-section"),
  { ssr: true, loading: () => <LoadingSpinner /> }
);
const GallerySection = dynamic(
  () => import("@/components/ui/gallery/gallery-section"),
  { ssr: true, loading: () => <LoadingSpinner /> }
);
const CallBookingSection = dynamic(
  () => import("@/components/ui/studio/call-booking-section"),
  { ssr: true, loading: () => <LoadingSpinner /> }
);

// Create a loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

export default function Home() {
  return (
    <>
      {/* <SplineHero /> */}
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
