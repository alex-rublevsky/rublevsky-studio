import { motion, useMotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { useCursorContext } from "./CustomCursorContext";
import "./customCursor.css";

// Enlarge SVG Component
const EnlargeCursor = () => (
  <svg
    width="29"
    height="29"
    viewBox="0 0 29 29"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M26 0H18V3H23.6387L14.6982 11.9399L5.76172 3.00281H11.3906V0.00280762L3.39062 0.00267029L2.76074 0.00195312L0.390625 0.00267029V2.36795V3.00281V11.0027H3.39062V5.36404L12.333 14.306L3.39355 23.2449V17.612H0.393555V25.612L0.392578 26.2421V26.246L0.393555 28.612H2.75879H3.39355H11.3936V25.612H5.75879L14.6992 16.6722L23.6357 25.6092H18.0029V28.6092L26.0029 28.6094L26.6367 28.6101L29.0029 28.6094V26.2441V25.6092V17.6094H26.0029V23.2442L17.0645 14.3061L26 5.37106V11H29V3L29.001 2.3699L29 0H26.6348H26Z"
      fill="currentColor"
    />
  </svg>
);

const LinkCursor = () => (
  <svg
    width="70"
    height="70"
    viewBox="0 0 70 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <path
      d="M69.9951 5.71484L70 5.71973L69.9951 5.72461V69.9951H61.9189V13.8008L6.6582 69.0615L0.948242 63.3506L56.2227 8.07617H0V0H69.9951V5.71484Z"
      fill="currentColor"
    />
  </svg>
);

const AddCursor = () => (
  <svg
    width="70"
    height="70"
    viewBox="0 0 70 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M39 31H70V39H39V70H31V39H0V31H31V0H39V31Z" fill="currentColor" />
  </svg>
);

const VisitWebsiteCursor = () => (
  <div className="px-7 py-4">
    <p>Visit the website</p>
  </div>
);

function Cursor() {
  const { animateCursorVariant, animateCursor } = useCursorContext();
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const [isPressed, setIsPressed] = useState(false);

  // Shared animation config
  const animationConfig = {
    duration: 0.4,
    ease: [0.215, 0.61, 0.355, 1],
  };

  // Press animation config (same bezier as sizing, but faster)
  const pressAnimationConfig = {
    duration: 0.15,
    ease: [0.215, 0.61, 0.355, 1],
  };

  // Simple state-based animations
  const isEnlargeHover = animateCursorVariant === "enlarge";
  const isLinkHover = animateCursorVariant === "link";
  const isAddHover = animateCursorVariant === "add";
  const isVisitWebsiteHover = animateCursorVariant === "visitWebsite";

  const isVisible =
    animateCursorVariant === "cursorEnter" ||
    isEnlargeHover ||
    isLinkHover ||
    isAddHover ||
    isVisitWebsiteHover;

  // Calculate scale factor for press animation (20% smaller = 0.8 scale)
  const pressScale = isPressed ? 0.8 : 1;

  useEffect(() => {
    const body = document.body;
    const mouseMoveHandler = (e: MouseEvent) => {
      // Center the cursor (3rem = 48px / 2 = 24px offset)
      cursorX.set(e.clientX - 12.8);
      cursorY.set(e.clientY - 12.8);
    };
    const mouseEnterHandler = () => {
      animateCursor("cursorEnter");
    };
    const mouseLeaveHandler = () => {
      animateCursor("cursorLeave");
    };
    const mouseDownHandler = () => {
      setIsPressed(true);
    };
    const mouseUpHandler = () => {
      setIsPressed(false);
    };

    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mousedown", mouseDownHandler);
    window.addEventListener("mouseup", mouseUpHandler);
    if (body) {
      body.addEventListener("mouseenter", mouseEnterHandler);
      body.addEventListener("mouseleave", mouseLeaveHandler);
    }
    return () => {
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mousedown", mouseDownHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
      if (body) {
        body.removeEventListener("mouseenter", mouseEnterHandler);
        body.removeEventListener("mouseleave", mouseLeaveHandler);
      }
    };
  }, [animateCursor, cursorX, cursorY]);

  return (
    <>
      {/* Main cursor with blend mode for circle and SVG cursors */}
      <motion.div
        className="cursor"
        style={{
          translateX: cursorX,
          translateY: cursorY,
          transformOrigin: "center",
        }}
      >
        {/* Default circle cursor */}
        <motion.div
          className="cursor-circle"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale:
              (isVisible &&
              !isEnlargeHover &&
              !isLinkHover &&
              !isAddHover &&
              !isVisitWebsiteHover
                ? 2
                : 0) * pressScale,
            opacity:
              isVisible &&
              !isEnlargeHover &&
              !isLinkHover &&
              !isAddHover &&
              !isVisitWebsiteHover
                ? 0.12
                : 0,
            transition: isPressed ? pressAnimationConfig : animationConfig,
          }}
        />

        {/* Enlarge SVG cursor */}
        <motion.div
          className="cursor-svg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: (isEnlargeHover ? 1 : 0) * pressScale,
            opacity: isEnlargeHover ? 1 : 0,
            transition: isPressed ? pressAnimationConfig : animationConfig,
          }}
        >
          <EnlargeCursor />
        </motion.div>

        {/* Link SVG cursor */}
        <motion.div
          className="cursor-svg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: (isLinkHover ? 1 : 0) * pressScale,
            opacity: isLinkHover ? 1 : 0,
            transition: isPressed ? pressAnimationConfig : animationConfig,
          }}
        >
          <LinkCursor />
        </motion.div>

        {/* Add SVG cursor */}
        <motion.div
          className="cursor-svg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: (isAddHover ? 1 : 0) * pressScale,
            opacity: isAddHover ? 1 : 0,
            transition: isPressed ? pressAnimationConfig : animationConfig,
          }}
        >
          <AddCursor />
        </motion.div>
      </motion.div>

      {/* Visit website cursor - separate from blend mode context */}
      <motion.div
        className="cursor-text-container"
        style={{
          translateX: cursorX,
          translateY: cursorY,
          transformOrigin: "center",
        }}
      >
        <motion.div
          className="cursor-text"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: (isVisitWebsiteHover ? 1 : 0) * pressScale,
            opacity: isVisitWebsiteHover ? 1 : 0,
            transition: isPressed ? pressAnimationConfig : animationConfig,
          }}
        >
          <VisitWebsiteCursor />
        </motion.div>
      </motion.div>
    </>
  );
}

export default Cursor;
