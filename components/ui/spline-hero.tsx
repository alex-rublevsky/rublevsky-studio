"use client";

import Script from "next/script";

interface SplineViewerProps {
  "loading-anim-type"?: string;
  url: string;
}

declare module "react" {
  interface IntrinsicElements {
    "spline-viewer": SplineViewerProps;
  }
}

export default function SplineHero() {
  return (
    <div className="relative w-screen h-screen">
      <Script
        type="module"
        src="https://unpkg.com/@splinetool/viewer@1.9.28/build/spline-viewer.js"
        strategy="afterInteractive"
      />
      {/* <spline-viewer
        loading-anim-type="spinner-big-dark"
        url="https://prod.spline.design/XRydKQhqfpYOjapX/scene.splinecode"
      /> */}
      <div className="absolute bottom-0 left-0 right-0 h-[12rem] bg-gradient-to-t from-background via-background/70 to-transparent" />
    </div>
  );
}
