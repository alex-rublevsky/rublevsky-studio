"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initializeAnimations } from "@/lib/animations/gsap-text-reading-and-heading";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize animations
    initializeAnimations();

    // Cleanup function that only kills ScrollTriggers that are no longer in the DOM
    return () => {
      if (typeof window !== "undefined" && ScrollTrigger) {
        ScrollTrigger.getAll().forEach((st) => {
          if (
            !st.vars.trigger ||
            (st.vars.trigger instanceof Element &&
              !document.contains(st.vars.trigger))
          ) {
            st.kill();
          }
        });
      }
    };
  }, [pathname]); // Re-run animations on route change

  return <>{children}</>;
}
