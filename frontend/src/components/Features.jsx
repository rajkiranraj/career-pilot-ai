import { ArrowUpRight, Zap, Palette, BarChart3, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ScrollFloat from "./ui/ScrollFloat";

export const FeaturesChess = () => {
  const { user } = useAuth();
  const rows = [
    {
      title: "Built for growth. Designed for success.",
      body: "Every insight is intentional. Our AI analyzes thousands of career trajectories to build a personalized path that outperforms the competition.",
      buttonText: "Explore Tools",
      path: "/dashboard",
      gif: "https://motionsites.ai/assets/hero-finlytic-preview-CV9g0FHP.gif",
      reverse: false,
    },
    {
      title: "Your career evolves. Automatically.",
      body: "Our guidance grows with you. AI monitors market trends, salary shifts, and skill demands to optimize your strategy in real time.",
      buttonText: "See the Impact",
      path: "/interview",
      gif: "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif",
      reverse: true,
    },
  ];

  return (
    <section className="py-24 md:py-48 px-6 lg:px-16 max-w-7xl mx-auto flex flex-col gap-24 md:gap-48">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-6 md:gap-8 mb-12 md:mb-24">
        <div className="liquid-glass rounded-full px-4 py-1.5 text-[10px] font-medium text-white/80 font-body uppercase tracking-[0.2em]">
          Capabilities
        </div>
        <ScrollFloat
          containerClassName="text-3xl md:text-6xl lg:text-7xl font-heading italic tracking-tight leading-[1] md:leading-[0.85] text-white"
        >
          Pro guidance. Zero guesswork.
        </ScrollFloat>
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div
          key={i}
          className={`flex flex-col ${
            row.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
          } items-center gap-12 md:gap-24 lg:gap-32`}
        >
          {/* Text Content */}
          <div className="flex-1 flex flex-col items-start gap-6 md:gap-10 max-w-lg text-left">
            <h3 className="text-2xl md:text-5xl font-heading italic text-white leading-tight md:leading-none">
              {row.title}
            </h3>
            <p className="text-white/60 font-body font-light text-sm md:text-lg leading-relaxed">
              {row.body}
            </p>
            <Link to={!user ? "/login" : row.path}>
              <button className="liquid-glass-strong rounded-full px-8 md:px-10 py-3 md:py-4 text-[10px] uppercase tracking-[0.2em] font-medium flex items-center gap-3 hover:scale-105 transition-all h-12 md:h-14">
                {row.buttonText}
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Image/Gif Content */}
          <div className="flex-1 w-full">
            <div className="liquid-glass rounded-2xl overflow-hidden aspect-video border border-white/10 group">
              <img
                src={row.gif}
                alt={row.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export const FeaturesGrid = () => {
  const cards = [
    {
      icon: <Zap className="w-5 h-5 text-black" />,
      title: "Fast-Track Success",
      body: "Accelerate your career with tools that work at the speed of thought. Because your future can't wait.",
    },
    {
      icon: <Palette className="w-5 h-5 text-black" />,
      title: "Expertly Guided",
      body: "Every resume bullet and interview answer refined by AI mentors. Design your career with absolute precision.",
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-black" />,
      title: "Built for Impact",
      body: "Strategies informed by real-world market data. Decisions backed by analytics. Results you can measure.",
    },
    {
      icon: <Shield className="w-5 h-5 text-black" />,
      title: "Personalized for You",
      body: "Tailored career coaching that understands your unique goals. Professional advancement that feels inevitable.",
    },
  ];

  return (
    <section className="py-24 md:py-48 px-6 lg:px-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-6 md:gap-8 mb-16 md:mb-32">
        <div className="liquid-glass rounded-full px-4 py-1.5 text-[10px] font-medium text-white/80 font-body uppercase tracking-[0.2em]">
          Why Us
        </div>
        <ScrollFloat
          containerClassName="text-3xl md:text-6xl lg:text-7xl font-heading italic tracking-tight leading-[1] md:leading-[0.85] text-white"
        >
          The difference is expert.
        </ScrollFloat>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {cards.map((card, i) => (
          <div
            key={i}
            className="liquid-glass relative border border-white/10 rounded-[2rem] md:rounded-3xl p-8 md:p-10 flex flex-col gap-8 md:gap-10 hover:bg-white/[0.04] hover:-translate-y-2 transition-all duration-500 ease-out group"
          >
            <div className="bg-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              {card.icon}
            </div>
            <div className="flex flex-col gap-4 md:gap-6 text-left">
              <h3 className="text-xl md:text-2xl font-heading italic text-white leading-none">
                {card.title}
              </h3>
              <p className="text-white/50 font-body font-light text-sm md:text-base leading-relaxed group-hover:text-white/70 transition-colors duration-500">
                {card.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
