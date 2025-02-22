import Image from "next/image";

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
                <div className="h-full w-full flex justify-center items-center p-4">
                  <Image
                    src="/logos/next-js.svg"
                    alt="Next.js Logo"
                    width={80}
                    height={80}
                    className="hover:opacity-70 transition-opacity"
                  />
                </div>
                <div className="w-3/4 h-full flex justify-center items-center p-4">
                  <Image
                    src="/logos/react.svg"
                    alt="React Logo"
                    width={80}
                    height={80}
                    className="hover:opacity-70 transition-opacity"
                  />
                </div>
                <div className="w-3/4 h-full flex justify-center items-center p-4">
                  <Image
                    src="/logos/laravel.svg"
                    alt="Laravel Logo"
                    width={80}
                    height={80}
                    className="hover:opacity-70 transition-opacity"
                  />
                </div>
                <div className="w-3/4 h-full flex justify-center items-center p-4">
                  <Image
                    src="/logos/html5.svg"
                    alt="HTML5 Logo"
                    width={80}
                    height={80}
                    className="hover:opacity-70 transition-opacity"
                  />
                </div>
              </div>

              <div className="flex justify-center items-center">
                <div className="w-full h-full flex justify-center items-center p-4">
                  <Image
                    src="/logos/tailwind.svg"
                    alt="Tailwind CSS Logo"
                    width={80}
                    height={80}
                    className="hover:opacity-70 transition-opacity"
                  />
                </div>
                <div className="h-full w-full flex justify-center items-center p-4">
                  <Image
                    src="/logos/alpine-js.svg"
                    alt="Alpine.js Logo"
                    width={80}
                    height={80}
                    className="hover:opacity-70 transition-opacity"
                  />
                </div>
                <div className="h-full w-3/4 flex justify-center items-center p-4">
                  <Image
                    src="/logos/webflow.svg"
                    alt="Webflow Logo"
                    width={80}
                    height={80}
                    className="hover:opacity-70 transition-opacity"
                  />
                </div>
                <div className="w-3/4 h-full flex justify-center items-center p-4">
                  <Image
                    src="/logos/php.svg"
                    alt="PHP Logo"
                    width={80}
                    height={80}
                    className="hover:opacity-70 transition-opacity"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Development Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-16 items-center">
          <div className="lg:col-span-4 flex justify-center items-center order-1">
            <div className="flex justify-center items-center w-full">
              <div className="w-3/4 h-full flex justify-center items-center p-4">
                <Image
                  src="/logos/git.svg"
                  alt="Git Logo"
                  width={80}
                  height={80}
                  className="hover:opacity-70 transition-opacity"
                />
              </div>
              <div className="w-full h-full flex justify-center items-center p-4">
                <Image
                  src="/logos/spline.png"
                  alt="Spline Logo"
                  width={80}
                  height={80}
                  className="hover:opacity-70 transition-opacity"
                />
              </div>
              <div className="w-3/4 h-full flex justify-center items-center p-4">
                <Image
                  src="/logos/wized.svg"
                  alt="Wized Logo"
                  width={80}
                  height={80}
                  className="hover:opacity-70 transition-opacity"
                />
              </div>
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
              professional digital content creation!!!!!!
            </h3>
          </div>
          <div className="lg:col-span-4 flex justify-center items-center order-1 lg:order-2">
            <div className="flex flex-wrap justify-center gap-4">
              <div className="w-1/3 flex justify-center items-center p-4">
                <Image
                  src="/logos/photoshop.svg"
                  alt="Photoshop Logo"
                  width={80}
                  height={80}
                  className="hover:opacity-70 transition-opacity"
                />
              </div>
              <div className="w-1/3 flex justify-center items-center p-4">
                <Image
                  src="/logos/illustrator.svg"
                  alt="Illustrator Logo"
                  width={80}
                  height={80}
                  className="hover:opacity-70 transition-opacity"
                />
              </div>
              <div className="w-1/3 flex justify-center items-center p-4">
                <Image
                  src="/logos/indesisgn.svg"
                  alt="InDesign Logo"
                  width={80}
                  height={80}
                  className="hover:opacity-70 transition-opacity"
                />
              </div>
              <div className="w-1/3 flex justify-center items-center p-4">
                <Image
                  src="/logos/after-effects.svg"
                  alt="After Effects Logo"
                  width={80}
                  height={80}
                  className="hover:opacity-70 transition-opacity"
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
                <Image
                  src="/logos/google-analytics.svg"
                  alt="Google Analytics Logo"
                  width={80}
                  height={80}
                  className="hover:opacity-70 transition-opacity"
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
