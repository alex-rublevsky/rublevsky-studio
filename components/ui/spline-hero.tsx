"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": any;
    }
  }
}

export default function SplineHero() {
  return (
    <div className="relative w-screen h-screen">
      <Script
        type="module"
        src="https://unpkg.com/@splinetool/viewer@1.9.28/build/spline-viewer.js"
        strategy="beforeInteractive"
      />
      <spline-viewer
        loading-anim-type="spinner-big-dark"
        url="https://prod.spline.design/XRydKQhqfpYOjapX/scene.splinecode"
      />
      <div className="absolute bottom-0 left-0 right-0 h-[12rem] bg-gradient-to-t from-background via-background/70 to-transparent" />
    </div>
  );
}
