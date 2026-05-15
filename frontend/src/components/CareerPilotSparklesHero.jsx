"use client";
import React, { useEffect, useState } from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { BlurText } from "./BlurText";

export function CareerPilotSparklesHero() {
  const [sparklesEnabled, setSparklesEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isCoarse = window.matchMedia("(pointer: coarse)");
    const lowMemory = typeof navigator !== "undefined" && navigator.deviceMemory && navigator.deviceMemory <= 4;
    const lowCores = typeof navigator !== "undefined" && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const enable = !(prefersReduced.matches || isCoarse.matches || lowMemory || lowCores);
    setSparklesEnabled(enable);
  }, []);

  return (
    <div className="h-[30rem] md:h-[40rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden relative">
      <div className="flex flex-col items-center justify-center gap-2 md:gap-4 relative z-20 px-6">
        <BlurText
          text="CareerPilot"
          delay={50}
          animateBy="letters"
          className="text-6xl md:text-7xl lg:text-9xl font-heading italic text-center text-white relative z-20"
        />
        <div className="w-[20rem] md:w-[40rem] h-40 relative">
          {/* Gradients */}
          <div className="absolute inset-x-10 md:inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-4/5 md:w-3/4 blur-sm" />
          <div className="absolute inset-x-10 md:inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-4/5 md:w-3/4" />
          <div className="absolute inset-x-20 md:inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-2/4 md:w-1/4 blur-sm" />
          <div className="absolute inset-x-20 md:inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-2/4 md:w-1/4" />

          {/* Core component */}
          {sparklesEnabled ? (
            <SparklesCore
              background="transparent"
              minSize={0.3}
              maxSize={0.9}
              speed={0.6}
              particleDensity={240}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/15 to-white/5" />
          )}

          {/* Radial Gradient to prevent sharp edges */}
          <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(250px_150px_at_top,transparent_20%,white)] md:[mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)] pointer-events-none"></div>
        </div>
        <p className="text-white/50 font-body font-light text-center uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-base -mt-16 md:-mt-20 relative z-30">
          Your AI-powered career coach
        </p>
      </div>
    </div>
  );
}
