import React, { useEffect, useState } from "react";
import { LoaderThree } from "@/components/ui/loader";

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
        <LoaderThree />
        <p className="loader-label">{label}</p>
        <div className="loader-track">
          <div className="loader-track-bar" />
        </div>
      </div>
    </div>
  );
};

export default LoaderScreen;
