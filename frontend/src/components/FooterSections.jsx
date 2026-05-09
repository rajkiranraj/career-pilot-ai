import Hls from "hls.js";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CardSpotlight } from "./ui/card-spotlight";
import ScrollFloat from "./ui/ScrollFloat";

export const Stats = () => {
  const videoRef = useRef(null);
  const stats = [
    { value: "10k+", label: "Careers transformed" },
    { value: "98%", label: "Success rate" },
    { value: "3.2x", label: "Higher salary" },
    { value: "12 days", label: "Average placement" },
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src =
      "https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8";

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
  }, []);

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden py-24 md:py-32 lg:py-48 px-6 md:px-8 lg:px-16">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 grayscale opacity-40 md:opacity-50"
      />
      <div className="absolute inset-0 bg-black/70 md:bg-black/60 z-0" />
      <div className="absolute top-0 w-full h-[150px] md:h-[200px] bg-gradient-to-b from-black to-transparent z-0 pointer-events-none" />
      <div className="absolute bottom-0 w-full h-[150px] md:h-[200px] bg-gradient-to-t from-black to-transparent z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="liquid-glass rounded-[2rem] md:rounded-[3rem] p-10 md:p-16 lg:p-24 border border-white/10 backdrop-blur-2xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 lg:gap-20">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col gap-3 md:gap-6 text-center">
                <span className="text-4xl md:text-6xl lg:text-7xl font-heading italic text-white tracking-tight leading-none">
                  {stat.value}
                </span>
                <span className="text-white/40 font-body font-light text-[8px] md:text-[10px] uppercase tracking-[0.2em]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Testimonials = () => {
  const reviews = [
    {
      quote:
        "The AI resume builder is a game-changer. I got 3 interviews in a week after struggling for months.",
      name: "Priya Patel",
      role: "Software Engineer",
      image: "/testimonials/priya.png",
    },
    {
      quote:
        "Mock interviews with CareerPilot felt so real. The feedback was brutal but exactly what I needed to land my dream role.",
      name: "Rahul Verma",
      role: "Product Manager",
      image: "/testimonials/rahul.png",
    },
    {
      quote:
        "CareerPilot didn't just help me find a job. They helped me define my career path. The premium feel is just the cherry on top.",
      name: "Ananya Iyer",
      role: "Design Lead",
      image: "/testimonials/ananya.png",
    },
  ];

  return (
    <section
      id="reviews"
      className="py-24 md:py-32 lg:py-48 px-6 md:px-8 lg:px-16 max-w-7xl mx-auto"
    >
      <div className="flex flex-col items-center text-center gap-6 md:gap-8 mb-16 md:mb-24 lg:mb-32">
        <div className="liquid-glass rounded-full px-5 py-2 text-[10px] font-medium text-white/80 font-body uppercase tracking-[0.2em]">
          Success Stories
        </div>
        <ScrollFloat
          containerClassName="text-4xl md:text-6xl lg:text-7xl font-heading italic tracking-tight leading-[0.9] md:leading-[0.85] text-white"
        >
          Real results for real careers.
        </ScrollFloat>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {reviews.map((review, i) => (
          <CardSpotlight
            key={i}
            className="liquid-glass rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-10 flex flex-col gap-8 md:gap-10 border border-white/5 hover:bg-white/[0.04] hover:scale-[1.02] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group"
          >
            <p className="relative z-20 text-white/80 font-body font-light text-base md:text-lg italic leading-relaxed group-hover:text-white transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
              "{review.quote}"
            </p>
            <div className="relative z-20 flex items-center gap-4 mt-auto">
              <img
                src={review.image}
                alt={review.name}
                className="w-12 h-12 rounded-full object-cover border border-white/20 shadow-xl"
              />
              <div className="flex flex-col gap-1">
                <span className="text-white font-body font-medium text-sm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  {review.name}
                </span>
                <span className="text-white/40 font-body font-light text-[10px] uppercase tracking-[0.2em] group-hover:text-white/70 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  {review.role}
                </span>
              </div>
            </div>
          </CardSpotlight>
        ))}
      </div>
    </section>
  );
};

export const CtaFooter = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src =
      "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

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
  }, []);

  return (
    <section className="relative min-h-[500px] md:min-h-[600px] flex flex-col items-center justify-center text-center overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 md:opacity-100"
      />
      <div className="absolute inset-0 bg-black/60 md:bg-black/50 z-0" />
      <div className="absolute top-0 w-full h-[100px] md:h-[150px] bg-gradient-to-b from-black to-transparent z-0 pointer-events-none" />
      <div className="absolute bottom-0 w-full h-[100px] md:h-[150px] bg-gradient-to-t from-black to-transparent z-0 pointer-events-none" />

      <div className="relative z-10 px-6 md:px-8 flex flex-col items-center max-w-4xl mx-auto gap-8 py-16 md:py-24">
        <ScrollFloat
          containerClassName="text-4xl md:text-5xl lg:text-6xl font-heading italic leading-[0.9] md:leading-[0.85] text-white mb-2"
        >
          Your future starts here.
        </ScrollFloat>
        <p className="text-white/70 font-body font-light text-sm md:text-base max-w-xl leading-relaxed mb-4 md:mb-6">
          Join 10,000+ professionals. See what AI-powered coaching can do. No
          commitment, no pressure. Just advancement.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full sm:w-auto">
          <Link to="/register" className="w-full sm:w-auto">
            <button className="w-full liquid-glass-strong rounded-full px-8 py-3.5 text-sm font-medium flex items-center justify-center gap-2 hover:scale-105 transition-all">
              Get Started
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => {
              document
                .getElementById("reviews")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto bg-white text-black rounded-full px-8 py-3.5 text-sm font-medium hover:bg-white/90 transition-all"
          >
            Success Stories
          </button>
        </div>

        <div className="mt-16 md:mt-24 w-full pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-white/70 text-[10px] md:text-xs font-body uppercase tracking-widest">
            &copy; 2026 CareerPilot. All rights reserved.
          </span>
          <div className="flex items-center gap-6 md:gap-8">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-white/70 text-[10px] md:text-xs font-body uppercase tracking-widest hover:text-white transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
