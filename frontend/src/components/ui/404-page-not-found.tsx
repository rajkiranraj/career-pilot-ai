"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TubesBackground } from "@/components/ui/TubesBackground";
import { Home, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Full-screen tubes background */}
      <div className="absolute inset-0 z-0">
        <TubesBackground enableClickInteraction={true} opacity={0.6} />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Giant 404 with neon glow */}
        <h1
          className="text-[10rem] sm:text-[14rem] font-heading italic font-bold leading-none text-white select-none"
          style={{
            textShadow:
              "0 0 40px rgba(249, 103, 251, 0.5), 0 0 80px rgba(105, 88, 213, 0.3), 0 0 120px rgba(83, 188, 40, 0.2)",
          }}
        >
          404
        </h1>

        <div className="mt-[-1rem] space-y-4">
          <h3 className="text-2xl sm:text-3xl font-heading italic text-white/90">
            Lost in the tubes
          </h3>
          <p className="text-white/50 text-sm font-body max-w-sm mx-auto">
            The page you're looking for doesn't exist. Click the background to play with colors, or head back home.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4 flex-wrap">
            <Button
              variant="glass"
              onClick={() => navigate(-1)}
              className="gap-2 text-xs uppercase tracking-[0.15em] px-6 h-11"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button
              variant="glass-strong"
              onClick={() => navigate("/")}
              className="gap-2 text-xs uppercase tracking-[0.15em] px-6 h-11"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        </div>

        <p className="mt-12 text-[10px] uppercase tracking-[0.3em] text-white/30 font-body">
          Click anywhere to randomize colors
        </p>
      </div>
    </section>
  );
}

