import { motion } from "motion/react";
import { ArrowUpRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { DiaTextReveal } from "./ui/dia-text-reveal";
import { InteractiveGrid } from "./ui/interactive-grid";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center text-center bg-black">
      {/* Background Interactive Grid */}
      <div className="absolute inset-0 z-0">
        <InteractiveGrid />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 pt-20 flex flex-col items-center max-w-5xl mx-auto">
        {/* Badge */}
        <div className="liquid-glass rounded-full px-1 py-1 flex items-center gap-3 mb-8">
          <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            New
          </span>

          <span className="text-sm text-white/90 pr-3 font-body">
            Introducing AI-powered career coaching.
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-7xl lg:text-[5.1rem] font-heading italic text-foreground leading-[0.8] max-w-4xl tracking-[-2px] md:tracking-[-4px] mb-8 text-center">
          The Career Your{" "}
          <DiaTextReveal
            repeat
            repeatDelay={2.5}
            duration={1}
            textColor="white"
            text={["Talent", "Vision", "Ambition"]}
          />
          {" "}Deserves
        </h1>

        {/* Subtext */}
        <motion.p
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-sm md:text-base text-white/70 font-body font-light leading-relaxed max-w-xl mb-12"
        >
          Expert guidance. AI precision. Built for growth, refined by mentors.
          This is career advancement, wildly reimagined.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto"
        >
          <Link to="/register" className="w-full sm:w-auto">
            <button className="w-full liquid-glass-strong rounded-full px-10 py-4 text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-3 hover:scale-105 transition-transform h-14">
              Start Your Journey
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => {
              document
                .getElementById("reviews")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] font-medium hover:text-white transition-colors h-14 px-6"
          >
            <div className="bg-white rounded-full p-2">
              <Play className="w-3.5 h-3.5 text-black fill-current ml-0.5" />
            </div>
            See Success Stories
          </button>
        </motion.div>

        {/* Partners Bar */}
        <div className="mt-auto pb-8 pt-24 md:pt-32 w-full flex flex-col items-center">
          <div className="liquid-glass rounded-full px-4 md:px-6 py-2 mb-8 text-[10px] md:text-xs text-white/50 uppercase tracking-[0.2em] font-body text-center">
            Placing talent at the teams behind
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {["Stripe", "Vercel", "Linear", "Notion", "Figma"].map(
              (partner) => (
                <span
                  key={partner}
                  className="text-xl md:text-3xl font-heading italic text-white/40 hover:text-white transition-colors cursor-default"
                >
                  {partner}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
