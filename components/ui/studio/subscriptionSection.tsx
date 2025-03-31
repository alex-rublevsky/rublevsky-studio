import Link from "next/link";
import { Button } from "../shared/button";
import NeumorphismCard from "../shared/neumorphism-card";

function SubscriptionSection() {
  return (
    <section className="mx-auto" id="subscription">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm uppercase tracking-wider mb-4">PRICING</p>
          <h1 className="text-5xl font-display mb-8">
            One Subscription,
            <br />
            endless design
          </h1>
        </div>

        <NeumorphismCard className="size-fit">
          <div className="mb-8">
            <h2 className="text-2xl mb-4">Monthly Club</h2>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-semibold">$495</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>Avg. 48 hour delivery</p>
              </div>
              <div>
                <p>Unlimited stock photos</p>
              </div>
              <div>
                <p>Unlimited brands</p>
              </div>
              <div>
                <p>Up to 2 users</p>
              </div>
              <div>
                <p>Webflow or React development</p>
              </div>
              <div>
                <p>Pause or cancel anytime</p>
              </div>
            </div>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link href="#booking">Join today</Link>
          </Button>
        </NeumorphismCard>
      </div>
    </section>
  );
}

export default SubscriptionSection;
