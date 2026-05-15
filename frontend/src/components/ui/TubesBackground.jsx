import React, { useEffect, useRef, useState } from 'react';

// Helper for random colors
const randomColors = (count) => {
  return new Array(count)
    .fill(0)
    .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
};

/**
 * TubesBackground — Interactive 3D neon tubes that follow the cursor.
 * Loads `threejs-components` from CDN for the WebGL effect.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Content overlay
 * @param {string} [props.className] - Extra classes on the wrapper
 * @param {boolean} [props.enableClickInteraction=true] - Click to randomize colors
 * @param {number} [props.opacity=1] - Canvas opacity (0–1) for subtle layering
 */
export function TubesBackground({
  children,
  className,
  enableClickInteraction = true,
  opacity = 1,
  tubeColors = ["#f967fb", "#53bc28", "#6958d5"],
  lightColors = ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"],
  lightIntensity = 200,
}) {
  const canvasRef = useRef(null);
  const tubesRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    let cleanup;

    const initTubes = async () => {
      if (!canvasRef.current) return;

      try {
        // Dynamic import from CDN — works in all modern browsers via native ESM
        const module = await import(
          /* @vite-ignore */
          'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'
        );
        const TubesCursor = module.default;

        if (!mounted) return;

        const app = TubesCursor(canvasRef.current, {
          tubes: {
            colors: tubeColors,
            lights: {
              intensity: lightIntensity,
              colors: lightColors,
            },
          },
        });

        tubesRef.current = app;
        setIsLoaded(true);

        const handleResize = () => {
          // threejs-components usually handles its own resize, but keep listener
          // in case manual trigger is ever needed
        };
        window.addEventListener('resize', handleResize);

        cleanup = () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error("Failed to load TubesCursor:", error);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, []);

  const handleClick = () => {
    if (!enableClickInteraction || !tubesRef.current) return;

    const colors = randomColors(3);
    const lightsColors = randomColors(4);

    tubesRef.current.tubes.setColors(colors);
    tubesRef.current.tubes.setLightsColors(lightsColors);
  };

  return (
    <div
      className={`relative w-full h-full min-h-[400px] overflow-hidden ${className || ''}`}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ touchAction: 'none', opacity }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  );
}

export default TubesBackground;
