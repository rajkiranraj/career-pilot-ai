import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const BACKEND_STEPS = [
  "Connecting to secure AI cognitive core...",
  "Processing input structures & metadata...",
  "Running semantic analysis on professional criteria...",
  "Aligning with target industry standards...",
  "Optimizing layout, vocabulary & syntactic flow...",
  "Finalizing response payload & checking formats..."
];

interface AILoaderProps {
  text?: string;
  className?: string;
  size?: "default" | "sm";
}

export const AILoader = ({ text = "Generating", className, size = "default" }: AILoaderProps) => {
  const isSm = size === "sm";
  const letters = text.split("");
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (isSm) return;
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % BACKEND_STEPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isSm]);

  return (
    <div className={cn("flex flex-col items-center justify-center", !isSm && "min-h-[220px]", className)}>
      {isSm ? (
        <div className="w-[80px] h-[32px] flex items-center justify-center overflow-visible">
          <div className="loader-wrapper scale-[0.35] origin-center shrink-0">
            {letters.map((letter, i) => (
              <span 
                key={i} 
                className="loader-letter"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
            <div className="loader"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="loader-wrapper">
            {letters.map((letter, i) => (
              <span 
                key={i} 
                className="loader-letter"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
            <div className="loader"></div>
          </div>
          
          {/* Sleek SaaS-level status message below loader */}
          <div 
            key={stepIndex} 
            className="mt-8 flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.4)] animate-status-fade-in"
          >
            <span className="text-indigo-400 font-semibold text-[10px] tracking-widest animate-pulse select-none">✦</span>
            <span className="text-white/60 text-[11px] font-medium tracking-wider font-sans select-none">
              {BACKEND_STEPS[stepIndex]}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export const Component = AILoader;
