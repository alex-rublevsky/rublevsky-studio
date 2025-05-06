import { Button } from "~/components/ui/Button";
import NeumorphismCard from "~/components/ui/NeumorphismCard";
import { TextEffect } from "~/components/motion_primitives/AnimatedText";
import { AnimatedGroup } from "~/components/motion_primitives/AnimatedGroup";
import { Link } from "@tanstack/react-router";

function HeroSection() {
  return (
    <section className="relative pb-20 lg:pb-0">
      <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex top-2 mb-8 md:mb-12">
        <AnimatedGroup className="hidden sm:flex gap-4">
          <Button asChild variant="outline">
            <Link to="/" hash="#booking">
              Book a call
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/" hash="#subscription">
              See pricing
            </Link>
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
                  <Link to="/" hash="#subscription">
                    See pricing
                  </Link>
                </Button>
              </div>
              <div className="flex gap-6">
                <div className="relative w-24 h-24">
                  <div
                    className={`absolute inset-0 overflow-hidden rounded-full aspect-square transition-all duration-500 
                      
                      `}
                  >
                    <img
                      src="/me.jpg"
                      alt="Profile picture"
                      className={`w-full h-full object-cover object-top transition-all duration-500 scale-200 origin-top`}
                      width={96}
                      height={96}
                      //priority
                    />
                  </div>
                </div>
                <div>
                  <div className="flex flex-col justify-center gap-2">
                    <h5>Book a 15-min call</h5>
                    <Link
                      to="/"
                      hash="#booking"
                      className="blurLink text-muted-foreground"
                    >
                      Schedule now →
                    </Link>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex gap-6">
                  <h5>
                    <a
                      href="mailto:alexander.rublevskii@gmail.com"
                      className="blurLink"
                    >
                      Email
                    </a>
                  </h5>
                  <h5>
                    <a
                      href="https://t.me/alexrublevsky"
                      className="blurLink"
                      target="_blank"
                    >
                      Telegram
                    </a>
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
