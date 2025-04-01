"use client";

import cloudflareLoader from "@/image-loader";
import { useState, useEffect } from "react";

type VideoProps = {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  ref?: React.RefObject<HTMLVideoElement>;
};

export default function Video({
  src,
  className,
  style,
  autoPlay = false,
  loop = false,
  muted = false,
  playsInline = false,
  ref,
}: VideoProps) {
  const [isClient, setIsClient] = useState(false);
  const videoSrc = cloudflareLoader({ src, width: 0, quality: 0 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={className} style={style}>
      {isClient && (
        <video
          ref={ref}
          src={videoSrc}
          className="w-full h-full object-cover"
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
        />
      )}
    </div>
  );
}
