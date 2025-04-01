"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@/lib/animations/liquid-metal-canvas";
import { cn } from "@/lib/utils";

// Inline SVG path for the R logo
const R_LOGO_SVG = `
<svg width="68" height="80" viewBox="0 0 68 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M34.4355 54.5039L41.2266 42.3516C46.707 42.3516 51.1549 42.9076 54.5703 44.0195C57.9857 45.0521 60.5671 46.9583 62.3145 49.7383C64.0618 52.4388 65.2135 56.291 65.7695 61.2949L67.9141 80H45.1582L43.0137 63.4395C42.696 60.4212 41.862 58.1973 40.5117 56.7676C39.2409 55.2585 37.2155 54.5039 34.4355 54.5039ZM35.7461 19.9531H23.7129V35.2031H35.7461C37.5729 35.2031 39.082 34.9251 40.2734 34.3691C41.5443 33.7337 42.4974 32.86 43.1328 31.748C43.8477 30.5566 44.2051 29.127 44.2051 27.459C44.2051 25.0762 43.4505 23.2493 41.9414 21.9785C40.5117 20.6283 38.4466 19.9531 35.7461 19.9531ZM41.2266 45.9258L40.2734 54.5039H23.7129V80H0.480469V0.652344H39.4395C44.9993 0.652344 49.8444 1.60547 53.9746 3.51172C58.1048 5.41797 61.3216 8.11849 63.625 11.6133C65.9284 15.0286 67.0801 19.0794 67.0801 23.7656C67.0801 28.2135 66.0078 32.1055 63.8633 35.4414C61.7188 38.7773 58.7005 41.3587 54.8086 43.1855C50.9167 45.0124 46.3893 45.9258 41.2266 45.9258Z" fill="black"/>
</svg>
`;

const SHADER_PARAMS = {
  refraction: 0.03,
  edge: 0.6,
  patternBlur: 0.01,
  liquid: 0.15,
  speed: 0.3,
  patternScale: 2.5,
} as const;

function smoothEdges(imageData: ImageData): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const shapeMask = new Array(width * height).fill(false);
  const u = new Float32Array(width * height).fill(0);
  const newU = new Float32Array(width * height).fill(0);

  // Create shape mask
  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    shapeMask[idx] = !(
      (data[i] === 255 &&
        data[i + 1] === 255 &&
        data[i + 2] === 255 &&
        data[i + 3] === 255) ||
      data[i + 3] === 0
    );
  }

  // Solve Poisson equation with simplified boundary detection
  const ITERATIONS = 50; // Reduced from 100 for better performance
  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (!shapeMask[idx]) continue;

        // Check if boundary pixel (simplified)
        const isBoundary =
          !shapeMask[idx - 1] ||
          !shapeMask[idx + 1] ||
          !shapeMask[idx - width] ||
          !shapeMask[idx + width];
        if (isBoundary) continue;

        // 5-point stencil
        newU[idx] =
          (0.01 + u[idx - 1] + u[idx + 1] + u[idx - width] + u[idx + width]) /
          4;
      }
    }
    u.set(newU);
  }

  // Create output image with optimized normalization
  const outImg = new ImageData(width, height);

  // Find max value using a loop instead of spread operator
  let maxVal = 0;
  for (let i = 0; i < u.length; i++) {
    maxVal = Math.max(maxVal, u[i]);
  }

  const scale = maxVal > 0 ? 1 / maxVal : 0;

  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    const value = shapeMask[idx]
      ? Math.round(255 * (1 - Math.pow(u[idx] * scale, 2.0)))
      : 255;

    outImg.data[i] = outImg.data[i + 1] = outImg.data[i + 2] = value;
    outImg.data[i + 3] = 255;
  }

  return outImg;
}

export function LiquidMetalR({ className }: { className?: string }) {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const CANVAS_HEIGHT = 1000;
  const CANVAS_WIDTH = Math.round(CANVAS_HEIGHT * (68 / 80)); // Using SVG aspect ratio directly

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    const blob = new Blob([R_LOGO_SVG], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const rawData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const processedData = smoothEdges(rawData);
      setImageData(processedData);
      setIsLoaded(true);
      URL.revokeObjectURL(url);
    };

    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, []);

  return (
    <div
      className={cn(
        "relative -ml-1.5 h-32 w-32 md:-ml-4 md:h-48 md:w-48",
        className
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 68 80"
          className={cn(
            "w-full h-full transition-opacity duration-1000 ease-in",
            isLoaded ? "opacity-100" : "opacity-100"
          )}
        >
          <path
            d="M34.4355 54.5039L41.2266 42.3516C46.707 42.3516 51.1549 42.9076 54.5703 44.0195C57.9857 45.0521 60.5671 46.9583 62.3145 49.7383C64.0618 52.4388 65.2135 56.291 65.7695 61.2949L67.9141 80H45.1582L43.0137 63.4395C42.696 60.4212 41.862 58.1973 40.5117 56.7676C39.2409 55.2585 37.2155 54.5039 34.4355 54.5039ZM35.7461 19.9531H23.7129V35.2031H35.7461C37.5729 35.2031 39.082 34.9251 40.2734 34.3691C41.5443 33.7337 42.4974 32.86 43.1328 31.748C43.8477 30.5566 44.2051 29.127 44.2051 27.459C44.2051 25.0762 43.4505 23.2493 41.9414 21.9785C40.5117 20.6283 38.4466 19.9531 35.7461 19.9531ZM41.2266 45.9258L40.2734 54.5039H23.7129V80H0.480469V0.652344H39.4395C44.9993 0.652344 49.8444 1.60547 53.9746 3.51172C58.1048 5.41797 61.3216 8.11849 63.625 11.6133C65.9284 15.0286 67.0801 19.0794 67.0801 23.7656C67.0801 28.2135 66.0078 32.1055 63.8633 35.4414C61.7188 38.7773 58.7005 41.3587 54.8086 43.1855C50.9167 45.0124 46.3893 45.9258 41.2266 45.9258Z"
            fill="currentColor"
            className="text-border"
          />
        </svg>
      </div>

      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-1000 ease-in",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      >
        {imageData && <Canvas imageData={imageData} params={SHADER_PARAMS} />}
      </div>
    </div>
  );
}
