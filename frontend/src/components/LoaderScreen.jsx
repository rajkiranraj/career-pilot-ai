import React, { useEffect, useState } from "react";
import { AILoader } from "@/components/ui/ai-loader";

const LoaderScreen = ({ label = "Loading...", overlay = false }) => {
  const [fadeOut, setFadeOut] = useState(false);

  const containerClasses = overlay
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/95"
    : "flex min-h-screen items-center justify-center bg-background";

  return (
    <div
      className={`${containerClasses} px-6 loader-screen-container ${
        fadeOut ? "loader-fade-out" : ""
      }`}
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <AILoader text={label} />
      </div>
    </div>
  );
};

export default LoaderScreen;
