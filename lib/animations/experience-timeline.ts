import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export const initExperienceTimeline = (styles: { [key: string]: string }) => {
    if (typeof window === "undefined") return;

    // Set initial states
    gsap.set(`.${styles.experienceTimelineRight}, .${styles.experienceTimelineDateText}`, {
        opacity: 0.20
    });
    gsap.set(`.${styles.experienceTimelineCircle}`, {
        backgroundColor: '#e5e5e5'
    });
    gsap.set(`.${styles.experienceTimelineProgress}, .${styles.experienceTimelineProgressBar}`, {
        opacity: 0
    });

    // Create animations for each timeline item
    const items = document.querySelectorAll(`.${styles.experienceTimelineItem}`);
    items.forEach(item => {
        gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: 'start 45%',
                end: 'start 35%',
                scrub: true,
            }
        })
        .to(item.querySelectorAll(`.${styles.experienceTimelineRight}, .${styles.experienceTimelineDateText}`), {
            opacity: 1,
        })
        .to(item.querySelector(`.${styles.experienceTimelineCircle}`), {
            backgroundColor: '#000000',
        }, '<');
    });

    // Control visibility of progress elements
    const timelineComponent = document.querySelector(`.${styles.experienceTimelineComponent}`);
    if (timelineComponent) {
        ScrollTrigger.create({
            trigger: timelineComponent,
            start: 'top 120%',
            end: 'bottom -20%',
            onEnter: () => gsap.to(`.${styles.experienceTimelineProgress}, .${styles.experienceTimelineProgressBar}`, { opacity: 1, duration: 0.1 }),
            onLeave: () => gsap.to(`.${styles.experienceTimelineProgress}, .${styles.experienceTimelineProgressBar}`, { opacity: 0, duration: 0.1 }),
            onEnterBack: () => gsap.to(`.${styles.experienceTimelineProgress}, .${styles.experienceTimelineProgressBar}`, { opacity: 1, duration: 0.1 }),
            onLeaveBack: () => gsap.to(`.${styles.experienceTimelineProgress}, .${styles.experienceTimelineProgressBar}`, { opacity: 0, duration: 0.1 })
        });
    }

    return () => {
        ScrollTrigger.getAll().forEach(st => st.kill());
    };
}; 