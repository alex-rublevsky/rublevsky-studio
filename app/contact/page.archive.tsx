import { ServicesOffered } from "@/components/ui/services-offered";
import { ExpertiseSection } from "@/components/ui/expertise-section";
import { ExperienceTimeline } from "@/components/ui/experience-timeline";
import { ProcessSection } from "@/components/ui/process-section";
import Image from "next/image";
import GreetingsSection from "@/components/ui/greetingsSection";

export default function ContactPage() {
  return (
    <main className="min-h-screen p-8 md:p-24">
      <GreetingsSection />

      <ServicesOffered />
      <ExpertiseSection />
      <ExperienceTimeline />
      <ProcessSection />
    </main>
  );
}
