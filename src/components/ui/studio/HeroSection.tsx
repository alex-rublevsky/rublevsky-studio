import { Button } from "~/components/ui/shared/Button";
import NeumorphismCard from "~/components/ui/shared/NeumorphismCard";
import { TextEffect } from "~/components/motion_primitives/AnimatedText";
import { AnimatedGroup } from "~/components/motion_primitives/AnimatedGroup";
import { Link as RouterLink } from "@tanstack/react-router";
import { Image } from "~/components/ui/shared/Image";
import { Link } from "~/components/ui/shared/Link";

function HeroSection() {
  return (
    <section className="relative pb-20 lg:pb-0">
      <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex top-2 mb-8 md:mb-12">
        <AnimatedGroup className="hidden sm:flex gap-4">
          <Button asChild variant="outline">
            <RouterLink to="/" hash="#booking">
              Book a call
            </RouterLink>
          </Button>
          <Button asChild variant="outline">
            <RouterLink to="/" hash="#subscription">
              See pricing
            </RouterLink>
          </Button>
        </AnimatedGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-items-center min-h-[80dvh]">
        <div className="flex flex-col gap-4 mr-auto">
          <TextEffect speedSegment={0.3} as="h1" className="max-w-[15ch]">
            Design subscriptions for everyone
          </TextEffect>

          <TextEffect
            speedSegment={0.3}
            as="p"
            className="text-xl text-muted-foreground"
          >
            Pause or cancel anytime.
          </TextEffect>
        </div>

        <AnimatedGroup delay={0.75}>
          <NeumorphismCard className="size-fit mr-auto md:mx-auto">
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="max-w-[11ch] mb-4">Join Rublevsky Studio</h3>
                <Button size="lg" asChild className="w-full text-lg">
                  <RouterLink to="/" hash="#subscription">
                    See pricing
                  </RouterLink>
                </Button>
              </div>
              <div className="flex gap-6">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 overflow-hidden rounded-full aspect-square transition-all duration-500">
                    <Image
                      src="/me.jpg"
                      alt="Profile picture"
                      width={96}
                      height={96}
                      quality={90}
                      className="w-full h-full object-cover object-top transition-all duration-500 scale-200 origin-top"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex flex-col justify-center gap-2">
                    <h5>Book a 15-min call</h5>
                    <RouterLink
                      to="/"
                      hash="#booking"
                      className="blurLink text-muted-foreground"
                    >
                      Schedule now →
                    </RouterLink>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex gap-6">
                  <h5>
                    <Link href="mailto:alexander.rublevskii@gmail.com">
                      Email
                    </Link>
                  </h5>
                  <h5>
                    <Link href="https://t.me/alexrublevsky" target="_blank">
                      Telegram
                    </Link>
                  </h5>
                </div>
              </div>
            </div>
          </NeumorphismCard>
        </AnimatedGroup>
      </div>
    </section>
  );
}

export default HeroSection;
