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

  // Create shape mask
  const shapeMask = new Array(width * height).fill(false);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx4 = (y * width + x) * 4;
      const r = data[idx4];
      const g = data[idx4 + 1];
      const b = data[idx4 + 2];
      const a = data[idx4 + 3];
      shapeMask[y * width + x] = !(
        (r === 255 && g === 255 && b === 255 && a === 255) ||
        a === 0
      );
    }
  }

  // Find boundary pixels
  const boundaryMask = new Array(width * height).fill(false);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!shapeMask[idx]) continue;

      // Check neighbors
      let isBoundary = false;
      for (let ny = y - 1; ny <= y + 1 && !isBoundary; ny++) {
        for (let nx = x - 1; nx <= x + 1 && !isBoundary; nx++) {
          if (
            nx < 0 ||
            nx >= width ||
            ny < 0 ||
            ny >= height ||
            !shapeMask[ny * width + nx]
          ) {
            isBoundary = true;
          }
        }
      }
      boundaryMask[idx] = isBoundary;
    }
  }

  // Solve Poisson equation
  const u = new Float32Array(width * height).fill(0);
  const newU = new Float32Array(width * height).fill(0);
  const C = 0.01;
  const ITERATIONS = 100;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (!shapeMask[idx] || boundaryMask[idx]) {
          newU[idx] = 0;
          continue;
        }
        let sum = 0;
        if (x > 0) sum += u[y * width + x - 1];
        if (x < width - 1) sum += u[y * width + x + 1];
        if (y > 0) sum += u[(y - 1) * width + x];
        if (y < height - 1) sum += u[(y + 1) * width + x];
        newU[idx] = (C + sum) / 4;
      }
    }
    // Copy newU to u
    u.set(newU);
  }

  // Create output image
  const outImg = new ImageData(width, height);
  let maxVal = 0;
  for (let i = 0; i < u.length; i++) {
    maxVal = Math.max(maxVal, u[i]);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const px = idx * 4;
      if (!shapeMask[idx]) {
        outImg.data[px] = outImg.data[px + 1] = outImg.data[px + 2] = 255;
        outImg.data[px + 3] = 255;
      } else {
        const raw = maxVal > 0 ? u[idx] / maxVal : 0;
        const gray = Math.round(255 * (1 - Math.pow(raw, 2.0)));
        outImg.data[px] = outImg.data[px + 1] = outImg.data[px + 2] = gray;
        outImg.data[px + 3] = 255;
      }
    }
  }

  return outImg;
}

export function LiquidMetalR({ className }: { className?: string }) {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Original SVG dimensions and aspect ratio
  const SVG_WIDTH = 68;
  const SVG_HEIGHT = 80;
  const SVG_ASPECT_RATIO = SVG_WIDTH / SVG_HEIGHT;

  // Define canvas size maintaining aspect ratio
  const CANVAS_HEIGHT = 1000;
  const CANVAS_WIDTH = Math.round(CANVAS_HEIGHT * SVG_ASPECT_RATIO);
  const SCALE_RATIO = 1.0;
  const TARGET_HEIGHT = CANVAS_HEIGHT * SCALE_RATIO;
  const TARGET_WIDTH = CANVAS_WIDTH * SCALE_RATIO;
  const OFFSET_Y = (CANVAS_HEIGHT - TARGET_HEIGHT) / 2;
  const OFFSET_X = (CANVAS_WIDTH - TARGET_WIDTH) / 2;

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create a Blob from the SVG string
    const blob = new Blob([R_LOGO_SVG], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const img = new window.Image();
    img.onload = () => {
      // Fill white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw SVG maintaining aspect ratio
      ctx.drawImage(img, OFFSET_X, OFFSET_Y, TARGET_WIDTH, TARGET_HEIGHT);

      // Process the image
      const rawData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const processedData = smoothEdges(rawData);
      setImageData(processedData);
      setIsLoaded(true);

      // Clean up
      URL.revokeObjectURL(url);
    };

    img.src = url;

    // Cleanup function
    return () => {
      URL.revokeObjectURL(url);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative -ml-1.5 h-32 w-32 md:-ml-4 md:h-48 md:w-48",
        className
      )}
    >
      {/* Static SVG that's always visible until animation loads */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "w-full h-full transition-opacity duration-1000 ease-in",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
          preserveAspectRatio="xMidYMid meet"
          style={{ objectFit: "contain" }}
        >
          <path
            d="M34.4355 54.5039L41.2266 42.3516C46.707 42.3516 51.1549 42.9076 54.5703 44.0195C57.9857 45.0521 60.5671 46.9583 62.3145 49.7383C64.0618 52.4388 65.2135 56.291 65.7695 61.2949L67.9141 80H45.1582L43.0137 63.4395C42.696 60.4212 41.862 58.1973 40.5117 56.7676C39.2409 55.2585 37.2155 54.5039 34.4355 54.5039ZM35.7461 19.9531H23.7129V35.2031H35.7461C37.5729 35.2031 39.082 34.9251 40.2734 34.3691C41.5443 33.7337 42.4974 32.86 43.1328 31.748C43.8477 30.5566 44.2051 29.127 44.2051 27.459C44.2051 25.0762 43.4505 23.2493 41.9414 21.9785C40.5117 20.6283 38.4466 19.9531 35.7461 19.9531ZM41.2266 45.9258L40.2734 54.5039H23.7129V80H0.480469V0.652344H39.4395C44.9993 0.652344 49.8444 1.60547 53.9746 3.51172C58.1048 5.41797 61.3216 8.11849 63.625 11.6133C65.9284 15.0286 67.0801 19.0794 67.0801 23.7656C67.0801 28.2135 66.0078 32.1055 63.8633 35.4414C61.7188 38.7773 58.7005 41.3587 54.8086 43.1855C50.9167 45.0124 46.3893 45.9258 41.2266 45.9258Z"
            fill="currentColor"
            className="text-border"
          />
        </svg>
      </div>

      {/* Liquid metal animation that fades in when ready */}
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
