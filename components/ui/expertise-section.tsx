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
        {/* First row */}
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
              <strong className="font-semibold">Figma</strong>, enabling me to
              design and build modern, performant web applications with
              beautiful user interfaces and seamless user experiences.
            </h3>
          </div>
          <div className="lg:col-span-4 flex justify-center items-center order-1 lg:order-2">
            <div className="flex flex-col w-full">
              <div className="flex justify-center items-center">
                <div className="h-full w-full flex justify-center items-center p-4">
                  <Image
                    src="/logos/nextjs.svg"
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
                    src="/logos/git.svg"
                    alt="Git Logo"
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
                    src="/logos/typescript.svg"
                    alt="TypeScript Logo"
                    width={80}
                    height={80}
                    className="hover:opacity-70 transition-opacity"
                  />
                </div>
                <div className="h-full w-3/4 flex justify-center items-center p-4">
                  <Image
                    src="/logos/figma.svg"
                    alt="Figma Logo"
                    width={80}
                    height={80}
                    className="hover:opacity-70 transition-opacity"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-16 items-center">
          <div className="lg:col-span-4 flex justify-center items-center order-1">
            <div className="flex justify-center items-center w-full">
              <div className="w-3/4 h-full flex justify-center items-center p-4">
                <Image
                  src="/logos/framer.svg"
                  alt="Framer Logo"
                  width={80}
                  height={80}
                  className="hover:opacity-70 transition-opacity"
                />
              </div>
              <div className="w-full h-full flex justify-center items-center p-4">
                <Image
                  src="/logos/vercel.svg"
                  alt="Vercel Logo"
                  width={80}
                  height={80}
                  className="hover:opacity-70 transition-opacity"
                />
              </div>
              <div className="w-3/4 h-full flex justify-center items-center p-4">
                <Image
                  src="/logos/prisma.svg"
                  alt="Prisma Logo"
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
              The modern web stack I use allows for rapid development and
              deployment, never compromising on quality or performance,
              delivering results that match those of a full development team.
            </h3>
          </div>
        </div>

        {/* Third row */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-16 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <h3
              className="text-lg md:text-xl lg:text-2xl text-left"
              reveal-type="true"
            >
              Using <strong className="font-semibold">component-driven</strong>{" "}
              development makes projects maintainable and scalable, while{" "}
              <strong className="font-semibold">modern APIs</strong> enable
              seamless integration with any third-party service or database.
            </h3>
          </div>
          <div className="lg:col-span-4 flex justify-center items-center order-1 lg:order-2">
            <div className="h-18 w-full">
              {/* Replace Spline with a suitable 3D viewer for Next.js or an image */}
              <div className="w-full aspect-square rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>

        {/* Print/Photo row */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-16 items-center">
          <div className="lg:col-span-4 flex justify-center items-center order-1">
            <video
              className="w-full h-auto aspect-square object-cover rounded-lg"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/videos/screen-printing.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="lg:col-span-6 order-2 flex lg:justify-end">
            <h3
              className="text-lg md:text-xl lg:text-2xl text-left lg:text-right"
              reveal-type="true"
            >
              Beyond digital, I bring expertise in{" "}
              <strong className="font-semibold">screen printing</strong> for
              apparel and posters, as well as professional{" "}
              <strong className="font-semibold">photography</strong> services
              capturing anything from portraits to products.
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}
