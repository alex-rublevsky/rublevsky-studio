import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import NeumorphismCard from "../shared/neumorphism-card";
import { TextEffect } from "@/components/motion-primitives/text-effect";

const data = [
  {
    title: "Flexible and scalable",
    description: "Scale up or down as needed, and pause or cancel at anytime",
  },
  {
    title: "Design board",
    description: "Easily manage your design queue with a Trello board.",
  },
  {
    title: "Fast delivery",
    description:
      "Get your design one at a time in just a couple days on average.",
  },
  {
    title: "Fixed monthly rate",
    description: "No surprises here! Pay the same fixed price each month.",
  },
  {
    title: "Top-notch quality",
    description:
      "Senior-level design quality at your fingertips, whenever you need it.",
  },
];

function MembershipBenefitsSection() {
  return (
    <section className="mx-auto">
      <TextEffect as="h2" className="mb-12">
        Membership Benefits
      </TextEffect>
      <AnimatedGroup className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8">
        {data.map((item) => (
          <NeumorphismCard key={item.title} className="w-full">
            <h3 className="mb-2">{item.title}</h3>
            <p className="text-muted-foreground">{item.description}</p>
          </NeumorphismCard>
        ))}
      </AnimatedGroup>
    </section>
  );
}
export default MembershipBenefitsSection;
