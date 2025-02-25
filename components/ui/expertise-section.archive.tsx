import Image from "next/image";
import SkillLogo from "./skillLogo";

export function ExpertiseSection() {
  return (
    <section className="w-full">
      <h2
        className="mb-10 text-2xl md:text-3xl lg:text-4xl font-bold"
        heading-reveal="true"
      >
        My expertise
      </h2>

      <div className="grid grid-cols-1 gap-16">
        {/* Web Development */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-16 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <h3
              className="text-lg md:text-xl lg:text-2xl text-left"
              reveal-type="true"
            >
              With over <strong className="font-semibold">3</strong> years of
              industry experience, I specialize in{" "}
              <strong className="font-semibold">Next.js</strong>,{" "}
              <strong className="font-semibold">React</strong>,{" "}
              <strong className="font-semibold">Tailwind CSS</strong>, and{" "}
              <strong className="font-semibold">HTML5</strong>, enabling me to
              design and build modern, performant web applications.
            </h3>
          </div>
          <div className="lg:col-span-4 flex justify-center items-center order-1 lg:order-2">
            <div className="flex flex-col w-full">
              <div className="flex justify-center items-center">
                <SkillLogo
                  name="Next.js"
                  alt="Next.js Logo"
                  link="/logos/next-js.svg"
                />
                <SkillLogo
                  name="React"
                  alt="React Logo"
                  link="/logos/react.svg"
                />
                <div className="w-3/4 h-full flex justify-center items-center p-4">
                  <SkillLogo
                    name="Laravel"
                    alt="Laravel Logo"
                    link="/logos/laravel.svg"
                  />
                </div>
                <SkillLogo
                  name="HTML5"
                  alt="HTML5 Logo"
                  link="/logos/html5.svg"
                />
              </div>

              <div className="flex justify-center items-center">
                <SkillLogo
                  name="Tailwind CSS"
                  alt="Tailwind CSS Logo"
                  link="/logos/tailwind.svg"
                />
                <SkillLogo
                  name="Alpine.js"
                  alt="Alpine.js Logo"
                  link="/logos/alpine-js.svg"
                />
                <SkillLogo
                  name="Webflow"
                  alt="Webflow Logo"
                  link="/logos/webflow.svg"
                />
                <SkillLogo name="PHP" alt="PHP Logo" link="/logos/php.svg" />
              </div>
            </div>
          </div>
        </div>

        {/* Development Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-16 items-center">
          <div className="lg:col-span-4 flex justify-center items-center order-1">
            <div className="flex justify-center items-center w-full">
              <SkillLogo name="Git" alt="Git Logo" link="/logos/git.svg" />
              <SkillLogo
                name="Spline"
                alt="Spline Logo"
                link="/logos/spline.png"
              />
              <SkillLogo
                name="Wized"
                alt="Wized Logo"
                link="/logos/wized.svg"
              />
            </div>
          </div>
          <div className="lg:col-span-6 order-2 flex lg:justify-end">
            <h3
              className="text-lg md:text-xl lg:text-2xl text-left lg:text-right"
              reveal-type="true"
            >
              I leverage modern development tools like{" "}
              <strong className="font-semibold">Git</strong>,{" "}
              <strong className="font-semibold">Spline</strong>, and{" "}
              <strong className="font-semibold">Wized</strong> to streamline
              development workflow and create engaging interactive experiences.
            </h3>
          </div>
        </div>

        {/* Adobe Creative Suite */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-16 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <h3
              className="text-lg md:text-xl lg:text-2xl text-left"
              reveal-type="true"
            >
              Proficient in the{" "}
              <strong className="font-semibold">Adobe Creative Suite</strong>,
              including <strong className="font-semibold">Photoshop</strong>,{" "}
              <strong className="font-semibold">Illustrator</strong>,{" "}
              <strong className="font-semibold">InDesign</strong>, and{" "}
              <strong className="font-semibold">After Effects</strong> for
              professional digital content creation!!
            </h3>
          </div>
          <div className="lg:col-span-4 flex justify-center items-center order-1 lg:order-2">
            <div className="flex flex-wrap justify-center gap-4">
              <div className="w-1/3 flex justify-center items-center p-4">
                <SkillLogo
                  name="Photoshop"
                  alt="Photoshop Logo"
                  link="/logos/photoshop.svg"
                />
              </div>
              <div className="w-1/3 flex justify-center items-center p-4">
                <SkillLogo
                  name="Illustrator"
                  alt="Illustrator Logo"
                  link="/logos/illustrator.svg"
                />
              </div>
              <div className="w-1/3 flex justify-center items-center p-4">
                <SkillLogo
                  name="InDesign"
                  alt="InDesign Logo"
                  link="/logos/indesisgn.svg"
                />
              </div>
              <div className="w-1/3 flex justify-center items-center p-4">
                <SkillLogo
                  name="After Effects"
                  alt="After Effects Logo"
                  link="/logos/after-effects.svg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Analytics and Print */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-16 items-center">
          <div className="lg:col-span-4 flex justify-center items-center order-1">
            <div className="flex justify-center items-center w-full">
              <div className="w-full h-full flex justify-center items-center p-4">
                <SkillLogo
                  name="Google Analytics"
                  alt="Google Analytics Logo"
                  link="/logos/google-analytics.svg"
                />
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 order-2 flex lg:justify-end">
            <h3
              className="text-lg md:text-xl lg:text-2xl text-left lg:text-right"
              reveal-type="true"
            >
              I utilize{" "}
              <strong className="font-semibold">Google Analytics</strong> for
              data-driven decision making, while also offering expertise in
              screen printing for physical media production.
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}
