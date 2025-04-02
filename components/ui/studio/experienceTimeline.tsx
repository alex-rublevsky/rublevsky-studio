"use client";

import styles from "./experienceTimeline.module.css";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

interface TimelineItem {
  date: string;
  logo: string;
  title: string;
  description: string;
  additionalImage?: string;
  wideLogo?: boolean;
}

const timelineItems: TimelineItem[] = [
  {
    date: "01/22 — 04/24",
    logo: "/logos/mohawk.svg",
    title: "Graphic design advanced 3 year program",
    description:
      "Gained hands-on experience in various aspects of graphic design, including print, branding, web design, through a comprehensive 3-year advanced program.",
    wideLogo: true,
  },
  {
    date: "05/23 - 09/23",
    logo: "/logos/beautyfloor.svg",
    title: "Flooring Business",
    description:
      "I have designed an e-commerce website for a flooring Business.",
    wideLogo: true,
  },
  {
    date: "01/24 - 04/24",
    logo: "/hpl.svg",
    title: "Government-funded public organization",
    description:
      "I was in charge of creating brand identities for the library events in various mediums from print materials to web and social media.",
  },
  {
    date: "01/24 - 04/24",
    logo: "/logos/inksoul.svg",
    title: "Tattoo studio",
    description:
      "I have designed and developed a website for a tattoo studio based in Vladivostok, Russia.",
  },
  {
    date: "04/24 - 05/24",
    logo: "/logos/aps.svg",
    title: "Africa Power Supply",
    description:
      "I have designed and developed a website for a Canadian startup that strives to revolutionize African waste-to-energy systems.",
  },
  {
    date: "01/24 - 04/24",
    logo: "/logos/Centre.png",
    title: "Centre3 for Artistic + Social Practice",
    description:
      "Participated in screen printing workshops and contributed to the Digital Pipeline 4 Youth program.",
    additionalImage: "/screen-printing-me.jpg",
    wideLogo: true,
  },
];

const TimelineItem = ({ item }: { item: TimelineItem }) => {
  const itemRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start 0.45", "start 0.36"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 1],
    ["#e5e5e5", "#000000"]
  );

  return (
    <div ref={itemRef} className={styles.experienceTimelineItem}>
      <motion.div className={styles.experienceTimelineLeft} style={{ opacity }}>
        <div className={styles.experienceTimelineDateWrapper}>
          <h4 className={styles.experienceTimelineDateText}>{item.date}</h4>
        </div>
      </motion.div>
      <div className={styles.experienceTimelineCenter}>
        <div className={styles.experienceTimelineCircleWrapper}>
          <motion.div
            className={styles.experienceTimelineCircle}
            style={{
              backgroundColor,
            }}
          ></motion.div>
        </div>
      </div>
      <motion.div
        className={styles.experienceTimelineRight}
        style={{ opacity }}
      >
        <div className={styles.experienceTimelineContent}>
          <Image
            src={item.logo}
            alt={`${item.title} Logo`}
            width={item.wideLogo ? 300 : 200}
            height={item.wideLogo ? 60 : 40}
            className={`mb-8 w-auto ${
              item.wideLogo ? "h-[2rem] md:h-[4rem]" : "h-[5rem] md:h-[7rem]"
            }`}
          />
          <h5 className="font-semibold">{item.title}</h5>
          <p>{item.description}</p>
          {item.additionalImage && (
            <Image
              src={item.additionalImage}
              alt={`Additional image for ${item.title}`}
              width={500}
              height={300}
              className="w-full mt-8 rounded-lg"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export function ExperienceTimeline() {
  return (
    <>
      <section className="pb-20">
        <h2>Experience</h2>
      </section>

      <section className={`no-padding ${styles.experienceTimelineSection}`}>
        <div className={styles.experienceTimelineComponent}>
          <div className={styles.experienceTimelineOverlayTop}></div>
          <div className={styles.experienceTimelineOverlayBottom}></div>
          <div className={styles.experienceTimelineProgress}></div>
          <div className={styles.experienceTimelineProgressBar}></div>

          {timelineItems.map((item, index) => (
            <TimelineItem key={index} item={item} />
          ))}
        </div>
      </section>
    </>
  );
}
