import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initializeCardStackingAnimation(): void {
  if (typeof window === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Kill existing ScrollTriggers for this section
  ScrollTrigger.getAll().forEach(st => {
    const trigger = st.vars.trigger as Element;
    if (trigger?.classList?.contains('section-features')) {
      st.kill();
    }
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.section-features',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      toggleActions: 'restart none reverse none',
      pin: '.features-wrapper',
    },
  });

  tl.from('.features-card', {
    opacity: 0,
    yPercent: 50,
    xPercent: 35,
    scale: 1.25,
    duration: 1,
    stagger: {
      each: 1,
      from: "start"
    },
  });
} 