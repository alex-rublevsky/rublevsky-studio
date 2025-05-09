import SkillLogo from "~/components/ui/studio/SkillLogo";
import { Badge } from "~/components/ui/shared/Badge";
import { AnimatedGroup } from "~/components/motion_primitives/AnimatedGroup";

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
          className="flex flex-wrap justify-center gap-x-8 gap-y-10 md:gap-x-14 md:gap-y-16"
        >
          <SkillLogo
            name="Next.js"
            alt="Next.js Logo"
            link="/logos/next-js.svg"
            wideLogo
          />
          <SkillLogo
            name="Typescript"
            alt="Typescript Logo"
            link="/logos/typescript.svg"
          />
          <SkillLogo name="React" alt="React Logo" link="/logos/react.svg" />

          <SkillLogo name="HTML5" alt="HTML5 Logo" link="/logos/html5.svg" />
          <SkillLogo
            name="Tailwind CSS"
            alt="Tailwind CSS Logo"
            link="/logos/tailwind.svg"
          />

          <SkillLogo
            name="Cloudflare"
            alt="Cloudflare Logo"
            link="/logos/cloudflare.png"
            wideLogo
          />
          <SkillLogo name="Motion" alt="Motion Logo" link="/logos/motion.png" />

          <SkillLogo
            name="Webflow"
            alt="Webflow Logo"
            link="/logos/webflow.svg"
          />
          <SkillLogo name="Git" alt="Git Logo" link="/logos/git.svg" wideLogo />
          <SkillLogo
            name="Wized"
            alt="Wized Logo"
            link="/logos/wized.svg"
            wideLogo
          />
          <SkillLogo
            name="Google Analytics"
            alt="Google Analytics Logo"
            link="/logos/google-analytics.svg"
            wideLogo
          />
          <SkillLogo
            name="PostHog"
            alt="PostHog Logo"
            link="/logos/posthog.svg"
            wideLogo
          />
          <SkillLogo
            name="Drizzle"
            alt="Drizzle Logo"
            link="/logos/drizzle.png"
          />
          <SkillLogo name="SQLite" alt="SQLite Logo" link="/logos/sqlite.svg" />
        </AnimatedGroup>

        <AnimatedGroup>
          <Badge variant="secondary" size="lg" className="z-50 mb-10 mt-20">
            Design
          </Badge>
        </AnimatedGroup>

        <AnimatedGroup
          staggerChildren={0.05}
          className="flex flex-wrap justify-center gap-x-8 gap-y-10 md:gap-x-14 md:gap-y-16"
        >
          <SkillLogo name="Figma" alt="Figma Logo" link="/logos/figma.svg" />
          <SkillLogo
            name="Photoshop"
            alt="Photoshop Logo"
            link="/logos/photoshop.svg"
          />
          <SkillLogo
            name="Illustrator"
            alt="Illustrator Logo"
            link="/logos/illustrator.svg"
          />

          <SkillLogo
            name="After Effects"
            alt="After Effects Logo"
            link="/logos/after-effects.svg"
          />
          <SkillLogo
            name="InDesign"
            alt="InDesign Logo"
            link="/logos/indesisgn.svg"
          />
          <SkillLogo
            name="Spline"
            alt="Spline Logo"
            link="/logos/spline.png"
            wideLogo
          />
        </AnimatedGroup>
      </div>
    </section>
  );
}
