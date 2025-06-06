import SkillLogo from "~/components/ui/studio/SkillLogo";
import { Badge } from "~/components/ui/shared/Badge";
import { AnimatedGroup } from "~/components/motion_primitives/AnimatedGroup";
import { ReactNode } from "react";

type Skill = {
  name: string;
  link?: string;
  wideLogo?: boolean;
  svg?: ReactNode;
};

const developmentSkills: Skill[] = [
  { name: "Next.js", link: "/logos/next-js.svg", wideLogo: true },
  { name: "Typescript", link: "/logos/typescript.svg" },
  { name: "React", link: "/logos/react.svg" },
  { name: "HTML5", link: "/logos/html5.svg" },
  { name: "Tailwind CSS", link: "/logos/tailwind.svg" },
  { name: "Cloudflare", link: "/logos/cloudflare.png", wideLogo: true },
  { name: "Motion", link: "/logos/motion.png" },
  { name: "Webflow", link: "/logos/webflow.svg" },
  { name: "Git", link: "/logos/git.svg", wideLogo: true },
  { name: "Wized", link: "/logos/wized.svg", wideLogo: true },
  {
    name: "Google Analytics",
    link: "/logos/google-analytics.svg",
    wideLogo: true,
  },
  { name: "PostHog", link: "/logos/posthog.svg", wideLogo: true },
  { name: "Drizzle", link: "/logos/drizzle.png" },
  {
    name: "Better Auth",
    svg: (
      <svg
        width="60"
        height="45"
        viewBox="0 0 60 45"
        fill="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0H15V15H30V30H15V45H0V30V15V0ZM45 30V15H30V0H45H60V15V30V45H45H30V30H45Z"
          className="fill-black"
        ></path>
      </svg>
    ),
  },
  { name: "Clerk", link: "/logos/clerk.png", wideLogo: true },
  { name: "SQLite", link: "/logos/sqlite.svg" },
];

const designSkills: Skill[] = [
  { name: "Figma", link: "/logos/figma.svg" },
  { name: "Photoshop", link: "/logos/photoshop.svg" },
  { name: "Illustrator", link: "/logos/illustrator.svg" },
  { name: "After Effects", link: "/logos/after-effects.svg" },
  { name: "InDesign", link: "/logos/indesisgn.svg" },
  { name: "Spline", link: "/logos/spline.png", wideLogo: true },
];

const allSkills: Skill[] = [...developmentSkills, ...designSkills];

export function SkillsSection() {
  return (
    <section className="w-full">
      <h2 heading-reveal="true">Skills</h2>

      <div className="mb-12 flex flex-col items-center">
        <AnimatedGroup>
          <Badge variant="secondary" size="lg" className="z-50 my-10">
            Development
          </Badge>
        </AnimatedGroup>

        <AnimatedGroup
          staggerChildren={0.05}
          className="flex flex-wrap justify-center items-end gap-x-8 gap-y-10 md:gap-x-14 md:gap-y-16"
        >
          {developmentSkills.map((skill, index) => (
            <SkillLogo
              key={skill.name}
              name={skill.name}
              link={skill.link}
              svg={skill.svg}
              wideLogo={skill.wideLogo}
            />
          ))}
        </AnimatedGroup>

        <AnimatedGroup>
          <Badge variant="secondary" size="lg" className="z-50 mb-10 mt-20">
            Design
          </Badge>
        </AnimatedGroup>

        <AnimatedGroup
          staggerChildren={0.05}
          className="flex flex-wrap justify-center items-end gap-x-8 gap-y-10 md:gap-x-14 md:gap-y-16"
        >
          {designSkills.map((skill, index) => (
            <SkillLogo
              key={skill.name}
              name={skill.name}
              link={skill.link}
              svg={skill.svg}
              wideLogo={skill.wideLogo}
            />
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
}
