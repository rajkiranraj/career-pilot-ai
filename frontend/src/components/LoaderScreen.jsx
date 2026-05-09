import React from "react";
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
      </div>
    </div>
  );
};

export default LoaderScreen;
