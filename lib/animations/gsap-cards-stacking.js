
function initializeCardStackingAnimation() {
    gsap.registerPlugin(ScrollTrigger);

let tl = gsap.timeline({
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
        from: "start" // Change this from "end" to "start"
    },
});

}

initializeCardStackingAnimation();
