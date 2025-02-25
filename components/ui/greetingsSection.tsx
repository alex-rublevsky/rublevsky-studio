import Image from "next/image";

function greetingsSection({}) {
  return (
    <section className="pt-4 relative">
      <div className="flex flex-col md:grid md:grid-cols-3 md:gap-4">
        <div className="py-2 md:col-span-2 md:h-full md:flex md:flex-col">
          <div>
            <h3 className="text-lg md:text-xl lg:text-2xl mb-4 break-words">
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

            <h5 className="my-8 text-lg md:text-xl break-words max-w-[46ch]">
              When I&apos;m not coding or designing, you can find me organizing{" "}
              <strong className="font-medium">
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
            <h3 className="blurLink">
              <a
                href="mailto:alexander.rublevskii@gmail.com"
                className="hover:opacity-70 transition-opacity"
                id="social-link-email"
              >
                Email
              </a>
            </h3>
            <h3 className="blurLink">
              <a
                href="https://t.me/alexrublevsky"
                className="hover:opacity-70 transition-opacity"
                target="_blank"
                id="social-link-telegram"
              >
                Telegram
              </a>
            </h3>
            <h3 className="blurLink">
              <a
                href="https://www.linkedin.com/in/rublevsky/"
                className="hover:opacity-70 transition-opacity"
                target="_blank"
                id="social-link-linkedin"
              >
                LinkedIn
              </a>
            </h3>
            <h3 className="blurLink">
              <a
                href="https://www.instagram.com/rublevsky.studio/"
                className="hover:opacity-70 transition-opacity"
                target="_blank"
                id="social-link-instagram"
              >
                Instagram
              </a>
            </h3>
          </div>
        </div>

        <div className="w-full mb-4 md:mb-0 md:col-span-1 -order-1 md:order-none">
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
