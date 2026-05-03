"use client";
import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { BlurText } from "./BlurText";

export function CareerPilotSparklesHero() {
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
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={1200}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />

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
