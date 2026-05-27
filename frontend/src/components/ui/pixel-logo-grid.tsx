"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/* -----------------------------------------------------------------------------
 * Pixel canvas
 * Animated grid of pixels that ripples in from the center on hover and fades
 * out on leave. Colors are drawn from the card's brand palette.
 * -------------------------------------------------------------------------- */

type Pixel = {
  x: number;
  y: number;
  color: string;
  ctx: CanvasRenderingContext2D;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeInt: number;
  maxSize: number;
  delay: number;
  counter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;
  draw: () => void;
  appear: () => void;
  disappear: () => void;
  shimmer: () => void;
};

function createPixel(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  color: string,
  baseSpeed: number,
  delay: number
): Pixel {
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const p: Pixel = {
    x, y, color, ctx,
    speed: rand(0.1, 0.9) * baseSpeed,
    size: 0,
    sizeStep: Math.random() * 0.4,
    minSize: 0.5,
    maxSizeInt: 2,
    maxSize: rand(0.5, 2),
    delay,
    counter: 0,
    counterStep: Math.random() * 4 + (canvas.width + canvas.height) * 0.01,
    isIdle: false,
    isReverse: false,
    isShimmer: false,
    draw() {
      const offset = p.maxSizeInt * 0.5 - p.size * 0.5;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x + offset, p.y + offset, p.size, p.size);
    },
    appear() {
      p.isIdle = false;
      if (p.counter <= p.delay) {
        p.counter += p.counterStep;
        return;
      }
      if (p.size >= p.maxSize) p.isShimmer = true;
      if (p.isShimmer) p.shimmer();
      else p.size += p.sizeStep;
      p.draw();
    },
    disappear() {
      p.isShimmer = false;
      p.counter = 0;
      if (p.size <= 0) {
        p.isIdle = true;
        return;
      }
      p.size -= 0.1;
      p.draw();
    },
    shimmer() {
      if (p.size >= p.maxSize) p.isReverse = true;
      else if (p.size <= p.minSize) p.isReverse = false;
      if (p.isReverse) p.size -= p.speed;
      else p.size += p.speed;
    },
  };

  return p;
}

type PixelCanvasProps = {
  colors: string[];
  gap?: number;
  speed?: number;
};

function PixelCanvas({ colors, gap = 5, speed = 30 }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number>(0);
  const lastFrameRef = useRef(performance.now());
  const reducedMotionRef = useRef(false);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = wrap.getBoundingClientRect();
    const w = Math.floor(width);
    const h = Math.floor(height);
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const effectiveSpeed = reducedMotionRef.current ? 0 : Math.min(speed, 100) * 0.001;
    const pixels: Pixel[] = [];

    // Each pixel's delay is its distance from the canvas center, so the
    // animation ripples outward from the middle on hover.
    for (let x = 0; x < w; x += gap) {
      for (let y = 0; y < h; y += gap) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const dx = x - w / 2;
        const dy = y - h / 2;
        const delay = reducedMotionRef.current ? 0 : Math.sqrt(dx * dx + dy * dy);
        pixels.push(createPixel(ctx, canvas, x, y, color, effectiveSpeed, delay));
      }
    }

    pixelsRef.current = pixels;
  }, [colors, gap, speed]);

  const animate = useCallback((mode: "appear" | "disappear") => {
    cancelAnimationFrame(animationRef.current);
    const frameInterval = 1000 / 60;

    const loop = () => {
      animationRef.current = requestAnimationFrame(loop);

      const now = performance.now();
      const elapsed = now - lastFrameRef.current;
      if (elapsed < frameInterval) return;
      lastFrameRef.current = now - (elapsed % frameInterval);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pixels = pixelsRef.current;
      for (const pixel of pixels) pixel[mode]();

      if (pixels.every((p) => p.isIdle)) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    animationRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    init();

    const resizeObserver = new ResizeObserver(() => init());
    if (wrapRef.current) resizeObserver.observe(wrapRef.current);

    // Hover is tracked on the parent card, not the canvas, so that the canvas
    // itself never blocks pointer events on the logo above it.
    const card = wrapRef.current?.parentElement;
    const handleEnter = () => animate("appear");
    const handleLeave = () => animate("disappear");
    card?.addEventListener("mouseenter", handleEnter);
    card?.addEventListener("mouseleave", handleLeave);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationRef.current);
      card?.removeEventListener("mouseenter", handleEnter);
      card?.removeEventListener("mouseleave", handleLeave);
    };
  }, [init, animate]);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * Logo SVGs
 * Each component accepts className and style so the parent card controls size
 * and rest/hover treatment. Mono logos use fill="currentColor" so the color
 * cascades from the parent's text color. Multicolor logos keep their own
 * fills and rely on CSS filters for the hover treatment.
 * -------------------------------------------------------------------------- */

type LogoSvgProps = { className?: string; style?: React.CSSProperties };

function StripeLogo({ className, style }: LogoSvgProps) {
  return (
    <svg viewBox="0 0 69 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
<path fillRule="evenodd" clipRule="evenodd" d="M59 16.3338C59 12.9159 57.3122 10.219 54.0864 10.219C50.8469 10.219 48.8869 12.9159 48.8869 16.3071C48.8869 20.3258 51.2008 22.3551 54.5219 22.3551C56.1417 22.3551 57.3667 21.9947 58.2922 21.4873V18.8171C57.3667 19.271 56.305 19.5514 54.9575 19.5514C53.6372 19.5514 52.4667 19.0975 52.3169 17.522H58.9728C58.9728 17.3485 59 16.6542 59 16.3338ZM52.2761 15.0654C52.2761 13.5568 53.2153 12.9293 54.0728 12.9293C54.9031 12.9293 55.7878 13.5568 55.7878 15.0654H52.2761Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M43.633 10.219C42.2992 10.219 41.4417 10.8331 40.9653 11.2604L40.7883 10.4326H37.7939V26L41.1967 25.2924L41.2103 21.514C41.7003 21.8611 42.4217 22.3551 43.6194 22.3551C46.0558 22.3551 48.2744 20.4326 48.2744 16.2003C48.2608 12.3285 46.015 10.219 43.633 10.219ZM42.8164 19.4179C42.0133 19.4179 41.5369 19.1375 41.2103 18.7904L41.1967 13.8371C41.5505 13.45 42.0405 13.1829 42.8164 13.1829C44.055 13.1829 44.9125 14.5447 44.9125 16.2937C44.9125 18.0828 44.0686 19.4179 42.8164 19.4179Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M33.1117 9.43124L36.5281 8.71028V6L33.1117 6.70761V9.43124Z" fill="currentColor"/>
<path d="M36.5281 10.4459H33.1117V22.1282H36.5281V10.4459Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M29.4503 11.4339L29.2325 10.4459H26.2925V22.1282H29.6953V14.211C30.4983 13.1829 31.8595 13.3698 32.2814 13.5167V10.4459C31.8458 10.2857 30.2533 9.99199 29.4503 11.4339Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M22.6447 7.5487L19.3236 8.24296L19.31 18.9372C19.31 20.9132 20.8208 22.3684 22.8353 22.3684C23.9514 22.3684 24.7681 22.1682 25.2172 21.9279V19.2176C24.7817 19.3911 22.6311 20.0053 22.6311 18.0293V13.2897H25.2172V10.4459H22.6311L22.6447 7.5487Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M13.4436 13.8371C13.4436 13.3164 13.8792 13.1162 14.6006 13.1162C15.635 13.1162 16.9417 13.4233 17.9761 13.9706V10.8331C16.8464 10.3925 15.7303 10.219 14.6006 10.219C11.8375 10.219 10 11.6342 10 13.9974C10 17.6823 15.1722 17.0948 15.1722 18.6836C15.1722 19.2977 14.6278 19.498 13.8656 19.498C12.7358 19.498 11.2931 19.0441 10.1497 18.4299V21.6075C11.4156 22.1415 12.695 22.3685 13.8656 22.3685C16.6967 22.3685 18.6431 20.9933 18.6431 18.6035C18.6294 14.6249 13.4436 15.3325 13.4436 13.8371Z" fill="currentColor"/>
</svg>
  );
}

function VercelLogo({ className, style }: LogoSvgProps) {
  return (
    <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path fillRule="evenodd" clipRule="evenodd" d="M7.49998 1L6.92321 2.00307L1.17498 12L0.599976 13H1.7535H13.2464H14.4L13.825 12L8.07674 2.00307L7.49998 1ZM7.49998 3.00613L2.3285 12H12.6714L7.49998 3.00613Z" fill="currentColor"/>
    </svg>
  );
}

function LinearLogo({ className, style }: LogoSvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M12.0019 1.5C6.20239 1.5 1.50195 6.20044 1.50195 12C1.50195 17.7996 6.20239 22.5 12.0019 22.5C17.8015 22.5 22.5019 17.7996 22.5019 12C22.5019 6.20044 17.8015 1.5 12.0019 1.5ZM5.4746 8.52542L15.4746 18.5254L18.5253 15.4746L8.52533 5.47461L5.4746 8.52542Z" fill="currentColor"/>
    </svg>
  );
}

function NotionLogo({ className, style }: LogoSvgProps) {
  return (
    <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M16.092 11.538 164.09.608c18.179-1.56 22.85-.508 34.28 7.801l47.243 33.282C253.406 47.414 256 48.975 256 55.207v182.527c0 11.439-4.155 18.205-18.696 19.24L65.44 267.378c-10.913.517-16.11-1.043-21.825-8.327L8.826 213.814C2.586 205.487 0 199.254 0 191.97V29.726c0-9.352 4.155-17.153 16.092-18.188Z" fill="currentColor"/>
    </svg>
  );
}

function FigmaLogo({ className, style }: LogoSvgProps) {
  return (
    <svg viewBox="0 0 54 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M13.3333 80.0002C20.6933 80.0002 26.6667 74.0268 26.6667 66.6668V53.3335H13.3333C5.97333 53.3335 0 59.3068 0 66.6668C0 74.0268 5.97333 80.0002 13.3333 80.0002Z" fill="#0ACF83" />
      <path d="M0 39.9998C0 32.6398 5.97333 26.6665 13.3333 26.6665H26.6667V53.3332H13.3333C5.97333 53.3332 0 47.3598 0 39.9998Z" fill="#A259FF" />
      <path d="M0 13.3333C0 5.97333 5.97333 0 13.3333 0H26.6667V26.6667H13.3333C5.97333 26.6667 0 20.6933 0 13.3333Z" fill="#F24E1E" />
      <path d="M26.6667 0H40.0001C47.3601 0 53.3334 5.97333 53.3334 13.3333C53.3334 20.6933 47.3601 26.6667 40.0001 26.6667H26.6667V0Z" fill="#FF7262" />
      <path d="M53.3334 39.9998C53.3334 47.3598 47.3601 53.3332 40.0001 53.3332C32.6401 53.3332 26.6667 47.3598 26.6667 39.9998C26.6667 32.6398 32.6401 26.6665 40.0001 26.6665C47.3601 26.6665 53.3334 32.6398 53.3334 39.9998Z" fill="#1ABCFE" />
    </svg>
  );
}

/* -----------------------------------------------------------------------------
 * Logo card
 * Wraps a single brand logo with its pixel canvas. The card renders the logo
 * in the brand's muted tonal color at rest, and crossfades to the full-color
 * version on hover. Multicolor logos use a grayscale filter at rest instead.
 * -------------------------------------------------------------------------- */

type LogoCardData = {
  name: string;
  Logo: React.ComponentType<LogoSvgProps>;
  colors: string[];
  restColor: string;       // CSS color applied to mono logos at rest
  isMultiColor?: boolean;  // true = logo keeps its own fills (Google, Microsoft, Slack)
};

const LOGOS: LogoCardData[] = [
  { name: "Stripe",    Logo: StripeLogo,    colors: ["#635BFF", "#00D4AA", "#0096FF"],            restColor: "#ffffff30" },
  { name: "Vercel",    Logo: VercelLogo,    colors: ["#ffffff", "#aaaaaa", "#555555"],            restColor: "#ffffff30" },
  { name: "Linear",    Logo: LinearLogo,    colors: ["#5E6AD2", "#FFFFFF", "#2A2A2A"],            restColor: "#ffffff30" },
  { name: "Notion",    Logo: NotionLogo,    colors: ["#000000", "#EAEAEA", "#888888"],            restColor: "#ffffff30" },
  { name: "Figma",     Logo: FigmaLogo,     colors: ["#0ACF83", "#A259FF", "#F24E1E", "#FF7262", "#1ABCFE"], restColor: "#ffffff30", isMultiColor: true },
];

function LogoCard({ data }: { data: LogoCardData }) {
  const { Logo, colors, restColor, isMultiColor } = data;
  const [hovered, setHovered] = useState(false);

  const logoStyle: React.CSSProperties = isMultiColor
    ? {
        filter: hovered ? "grayscale(0) brightness(1)" : "grayscale(1) brightness(0.4)",
        transition: "filter 0.5s ease-out",
      }
    : {
        color: hovered ? "rgba(255,255,255,0.85)" : restColor,
        transition: "color 0.5s ease-out",
      };

  return (
    <div
      className="relative flex h-16 sm:h-20 items-center justify-center overflow-hidden rounded-lg cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pixel canvas – subtle background effect */}
      <PixelCanvas colors={colors} gap={8} speed={20} />

      {/* Logo with smooth hover transition */}
      <Logo
        className="relative z-10 h-5 w-auto max-w-[80%]"
        style={logoStyle}
      />
    </div>
  );
}


/* -----------------------------------------------------------------------------
 * Public component
 * A responsive horizontal logo bar. Renders logos in a single flowing row that
 * wraps naturally on smaller screens.
 * -------------------------------------------------------------------------- */

type PixelLogoGridProps = {
  className?: string;
};

export default function PixelLogoGrid({ className }: PixelLogoGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-5 gap-1 sm:gap-2",
      className,
    )}>
      {LOGOS.map((data) => (
        <LogoCard key={data.name} data={data} />
      ))}
    </div>
  );
}

export { PixelLogoGrid, PixelCanvas, StripeLogo, VercelLogo, LinearLogo, NotionLogo, FigmaLogo };
