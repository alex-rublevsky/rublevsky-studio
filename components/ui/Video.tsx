"use client";

import cloudflareLoader from "@/image-loader";

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
  const videoSrc = cloudflareLoader({ src, width: 0, quality: 0 });

  return (
    <video
      ref={ref}
      src={videoSrc}
      className={className}
      style={style}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
    />
  );
}
