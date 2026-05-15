import React from "react";
import { motion } from "motion/react";
import { LoaderThree } from "@/components/ui/loader";

const LoaderScreen = ({ label = "Loading...", overlay = false }) => {
  const containerClasses = overlay
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/95"
    : "flex min-h-screen items-center justify-center bg-background";

  return (
    <div className={`${containerClasses} px-6`}>
      <div className="flex flex-col items-center gap-4 text-center">
        <LoaderThree />
        <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/70">
          {label}
        </p>
        <div className="h-1 w-44 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full w-1/3 rounded-full bg-white/70"
            animate={{ x: ["-120%", "220%"] }}
            transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
          />
        </div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
          Usually ready in under 2 seconds
        </p>
      </div>
    </div>
  );
};

export default LoaderScreen;

