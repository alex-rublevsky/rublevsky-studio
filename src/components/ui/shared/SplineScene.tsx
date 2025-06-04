import Spline from "@splinetool/react-spline";
import { Suspense } from "react";

interface SplineSceneProps {
  scene: string;
  className?: string;
}

function SplineSceneFallback() {
  return <div className="bg-bakground"></div>;
}

export default function SplineScene({
  scene,
  className = "",
}: SplineSceneProps) {
  return (
    <div className={`relative ${className}`}>
      <Suspense fallback={<SplineSceneFallback />}>
        <Spline
          scene={scene}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </Suspense>

      {/* Bottom gradient overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "9rem",
          background:
            "linear-gradient(to top, #F1F1F3 0%, #F1F1F3 44.44%, transparent 100%)",
        }}
      />
    </div>
  );
}
