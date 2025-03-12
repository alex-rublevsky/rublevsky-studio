import Image from "next/image";

function greetingsSection({}) {
  return (
    <section className="pt-4 relative">
      <div className="flex flex-col md:grid md:grid-cols-5 md:gap-4">
        <div className="py-2 md:col-span-3 md:h-full md:flex md:flex-col">
          <div>
            <h3 className="text-2xl leading-[1.3] md:text-3xl md:leading-[1.3] lg:text-4xl lg:leading-[1.4] mb-4 break-words">
              Greetings! My name is Alexander. I am a{" "}
              <strong className="font-semibold">visual web developer</strong>{" "}
              based in Ontario<sup>1</sup>, by way of New Zealand<sup>2</sup>{" "}
              and originally from Russia<sup>3</sup>. Just finished my time at
              Hamilton Public Library where I was helping with{" "}
              <strong className="font-semibold">branding</strong>.
            </h3>

            <div className="mt-4">
              <div className="flex flex-wrap gap-8">
                <p>1. Hamilton</p>
                <p>2. Auckland</p>
                <p>3. Vladivostok</p>
              </div>
            </div>

            <h5 className="my-8 font-normal text-lg md:text-xl break-words max-w-[46ch]">
              When I&apos;m not coding or designing, you can find me organizing{" "}
              <strong className="font-bold">
                traditional Chinese tea ceremony
              </strong>{" "}
              events, or{" "}
              <a
                href="https://soundcloud.com/alexrublevsky/let-god"
                className="hover:opacity-70 transition-opacity"
                id="social-link-soundcloud"
              >
                rhyming over beats
              </a>
              .
            </h5>
          </div>

          <div className="mt-auto flex flex-wrap gap-6">
            <h4 className="blurLink">
              <a
                href="mailto:alexander.rublevskii@gmail.com"
                className="hover:opacity-70 transition-opacity"
                id="social-link-email"
              >
                Email
              </a>
            </h4>
            <h4 className="blurLink">
              <a
                href="https://t.me/alexrublevsky"
                className="hover:opacity-70 transition-opacity"
                target="_blank"
                id="social-link-telegram"
              >
                Telegram
              </a>
            </h4>
            <h4 className="blurLink">
              <a
                href="https://www.linkedin.com/in/rublevsky/"
                className="hover:opacity-70 transition-opacity"
                target="_blank"
                id="social-link-linkedin"
              >
                LinkedIn
              </a>
            </h4>
            <h4 className="blurLink">
              <a
                href="https://www.instagram.com/rublevsky.studio/"
                className="hover:opacity-70 transition-opacity"
                target="_blank"
                id="social-link-instagram"
              >
                Instagram
              </a>
            </h4>
          </div>
        </div>

        <div className="w-full mb-4 md:mb-0 md:col-span-2 -order-1 md:order-none">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src="/me.jpg"
              alt="Profile picture"
              className="w-full h-full object-cover"
              fill
            />
          </div>
        </div>
      </div>
    </section>
  );
}
export default greetingsSection;
