import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ScrollFloat from "./ui/ScrollFloat";

export const StartSection = () => {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShouldPlay(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldPlay(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldPlay) return;
    const video = videoRef.current;
    if (!video) return;

    const src =
      "https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8";

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.error("Video play failed:", e));
      });

      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((e) => console.error("Video play failed:", e));
      });
    }
  }, [shouldPlay]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[500px] flex flex-col items-center justify-center text-center overflow-hidden py-20 md:py-32"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        preload="metadata"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/40 z-0" />
      <div className="absolute top-0 w-full h-[150px] md:h-[200px] bg-gradient-to-b from-black to-transparent z-0 pointer-events-none" />
      <div className="absolute bottom-0 w-full h-[150px] md:h-[200px] bg-gradient-to-t from-black to-transparent z-0 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 px-6 flex flex-col items-center max-w-4xl mx-auto gap-6 md:gap-8">
        <div className="liquid-glass rounded-full px-4 py-1.5 text-[10px] font-medium text-white/80 font-body uppercase tracking-[0.2em]">
          The Process
        </div>

        <ScrollFloat
          containerClassName="text-3xl md:text-5xl lg:text-6xl font-heading italic tracking-tight leading-[1] md:leading-[0.9] text-white"
        >
          You dream it. We guide it.
        </ScrollFloat>

        <p className="text-white/60 font-body font-light text-xs md:text-base max-w-xl leading-relaxed">
          Share your goals. Our AI handles the heavy lifting—resume
          optimization, interview prep, and career mapping. All in days, not
          years.
        </p>

        <button className="liquid-glass-strong rounded-full px-8 py-3.5 text-[10px] md:text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all uppercase tracking-widest">
          Start Your Transformation
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
