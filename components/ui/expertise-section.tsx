import Image from "next/image";
import SkillLogo from "./skillLogo";

export function ExpertiseSection() {
  return (
    <section className="w-full">
      <h2 heading-reveal="true">Skills</h2>

      <div className="mb-12 flex flex-col items-center">
        <div className="bg-neutral-100 rounded-lg px-3 py-1 my-10">
          <h3 className="text-lg md:text-xl lg:text-2xl">Development</h3>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-10 md:gap-x-14 md:gap-y-16">
          <SkillLogo
            name="Next.js"
            alt="Next.js Logo"
            link="/logos/next-js.svg"
            wideLogo
          />
          <SkillLogo name="React" alt="React Logo" link="/logos/react.svg" />
          <SkillLogo
            name="Laravel"
            alt="Laravel Logo"
            link="/logos/laravel.svg"
          />
          <SkillLogo name="HTML5" alt="HTML5 Logo" link="/logos/html5.svg" />
          <SkillLogo
            name="Tailwind CSS"
            alt="Tailwind CSS Logo"
            link="/logos/tailwind.svg"
          />

          <SkillLogo
            name="Webflow"
            alt="Webflow Logo"
            link="/logos/webflow.svg"
          />
          <SkillLogo name="PHP" alt="PHP Logo" link="/logos/php.svg" />
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
        </div>

        <div className="bg-neutral-100 rounded-lg px-3 py-1 mb-10 mt-20">
          <h3 className="text-lg md:text-xl lg:text-2xl">Design</h3>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-10 md:gap-x-14 md:gap-y-16">
          <SkillLogo
            name="Spline"
            alt="Spline Logo"
            link="/logos/spline.png"
            wideLogo
          />
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
        </div>
      </div>
    </section>
  );
}
