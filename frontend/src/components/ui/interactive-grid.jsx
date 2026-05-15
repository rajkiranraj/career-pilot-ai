"use client";

import { useEffect, useRef, useState } from "react";

export function InteractiveGrid({
  dotDistance = 42,
  dotRadius = 1.6,
  minProximity = 160,
  repaintAlpha = 0.9,
}) {
  const canvasRef = useRef(null);
  const [params] = useState({
    dotDistance,
    dotRadius,
    minProximity,
    repaintAlpha,
  });
  const [enabled, setEnabled] = useState(true);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hue, setHue] = useState(0);
  const dotsRef = useRef([]);
  const minProxSquaredRef = useRef(params.minProximity * params.minProximity);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isCoarse = window.matchMedia("(pointer: coarse)");
    const lowMemory = typeof navigator !== "undefined" && navigator.deviceMemory && navigator.deviceMemory <= 4;
    const lowCores = typeof navigator !== "undefined" && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const shouldDisable = prefersReduced.matches || isCoarse.matches || lowMemory || lowCores;
    setEnabled(!shouldDisable);
  }, []);

  const createDots = (w, h) => {
    const newDots = [];
    for (let x = 0; x < w; x += params.dotDistance) {
      for (let y = 0; y < h; y += params.dotDistance) {
        newDots.push({
          x,
          y,
          render: (ctx, mousePos, p) => {
            const dX = x - mousePos.x;
            const dY = y - mousePos.y;
            const distSquared = dX * dX + dY * dY;

            if (distSquared <= minProxSquaredRef.current) {
              const brightness = 50 - (distSquared / minProxSquaredRef.current) * 40;
              const color = `hsl(${hue}, 80%, ${brightness}%)`;

              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.beginPath();
              ctx.arc(x, y, p.dotRadius, 0, Math.PI * 2);
              ctx.fill();

              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(mousePos.x, mousePos.y);
              ctx.stroke();
            } else {
              ctx.fillStyle = "rgba(34, 34, 34, 0.5)"; // dim neutral dots
              ctx.beginPath();
              ctx.arc(x, y, p.dotRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          },
        });
      }
    }
    dotsRef.current = newDots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createDots(canvas.width, canvas.height);
  }, [params.dotDistance]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMouse({ x, y });
    setHue(((x / canvas.width + y / canvas.height) * 360) % 360);
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createDots(canvas.width, canvas.height);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [params]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      const now = performance.now();
      if (now - lastFrameRef.current < 50) {
        requestAnimationFrame(animate);
        return;
      }
      lastFrameRef.current = now;
      // Clear the canvas (no background fill → transparent)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dotsRef.current.forEach((dot) => dot.render(ctx, mouse, params));
      requestAnimationFrame(animate);
    };

    animate();
  }, [params, mouse, enabled]);

  if (!enabled) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-transparent">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/30" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ display: "block", background: "transparent" }}
      />
    </div>
  );
}
