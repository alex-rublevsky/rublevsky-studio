"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@/lib/animations/liquid-metal-canvas";

// Fixed shader parameters optimized for the R logo
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

export function LiquidMetalR() {
  const [imageData, setImageData] = useState<ImageData | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const size = 1000;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Fill white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, size, size);

      // Draw SVG centered at 80% of canvas size
      const targetSize = size * 0.8;
      const offset = (size - targetSize) / 2;
      ctx.drawImage(img, offset, offset, targetSize, targetSize);

      // Process the image
      const rawData = ctx.getImageData(0, 0, size, size);
      const processedData = smoothEdges(rawData);
      setImageData(processedData);
    };

    img.src = "/r-overused-grotesk.svg";
  }, []);

  if (!imageData) return null;

  return (
    <div className="-m-4 w-[11rem] h-[11rem]">
      <Canvas imageData={imageData} params={SHADER_PARAMS} />
    </div>
  );
}
