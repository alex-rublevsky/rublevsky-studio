"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LiquidMetalR } from "@/app/components/LiquidMetalR";
import { Button } from "@/components/ui/shared/button";
import NeumorphismCard from "../shared/neumorphism-card";

function HeroSection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative">
      <div className="relative flex top-2 mb-8 md:mb-12">
        <LiquidMetalR />
        <div className="hidden sm:flex sm:absolute sm:left-1/2 sm:-translate-x-1/2 gap-4">
          <Button asChild variant="outline">
            <Link href="#booking">Book a call</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="#subscription">See pricing</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-items-center">
        <div className="flex flex-col gap-4 mr-auto">
          <h1 className="max-w-[15ch]">Design subscriptions for everyone</h1>
          <p className="text-xl text-muted-foreground">
            Pause or cancel anytime.
          </p>
        </div>

        <NeumorphismCard className="size-fit mr-auto md:mx-auto">
          <div className="flex flex-col gap-8">
            <div
              className={
                isHovered
                  ? "md:blur-sm transition-all duration-500"
                  : "transition-all duration-500"
              }
            >
              <h3 className="max-w-[11ch] mb-4">Join Rublevsky Studio</h3>
              <Button size="lg" asChild className="w-full text-lg">
                <Link href="#subscription">See pricing</Link>
              </Button>
            </div>
            <div className="flex gap-6">
              <div
                className="relative w-24 h-24"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div
                  className={`absolute inset-0 overflow-hidden rounded-full aspect-square transition-all duration-500 ${isHovered ? "md:scale-[3] md:z-50" : ""}`}
                >
                  <Image
                    src="/me.jpg"
                    alt="Profile picture"
                    className={`w-[200%] h-[200%] object-cover object-top transition-all duration-500 ${isHovered ? "md:w-full md:h-full" : ""}`}
                    width={192}
                    height={192}
                    priority
                  />
                </div>
              </div>
              <div
                className={
                  isHovered
                    ? "md:blur-sm transition-all duration-500"
                    : "transition-all duration-500"
                }
              >
                <div className="flex flex-col justify-center gap-2">
                  <h5>Book a 15-min call</h5>
                  <Link
                    href="#booking"
                    className="blurLink text-muted-foreground"
                  >
                    Schedule now →
                  </Link>
                </div>
              </div>
            </div>
            <div
              className={
                isHovered
                  ? "md:blur-sm transition-all duration-500"
                  : "transition-all duration-500"
              }
            >
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
      </div>
    </section>
  );
}

export default HeroSection;
