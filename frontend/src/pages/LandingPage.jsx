import React from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { CareerPilotSparklesHero } from "../components/CareerPilotSparklesHero";
import { StartSection } from "../components/StartSection";
import { FeaturesChess, FeaturesGrid } from "../components/Features";
import { Stats, Testimonials, CtaFooter } from "../components/FooterSections";
import { ScrollShowcase } from "../components/ui/ScrollShowcase";
import ReactLenis from "lenis/react";

export default function LandingPage() {
  return (
    <ReactLenis root>
      <div className="bg-black text-white selection:bg-white selection:text-black min-h-screen overflow-x-hidden">
      <div className="relative z-10">
        <Navbar />

        <main>
          <Hero />
          <CareerPilotSparklesHero />

          <div className="bg-black relative">
            <StartSection />
            <FeaturesChess />
            <FeaturesGrid />
            <ScrollShowcase />
            <Stats />
            <Testimonials />
            <CtaFooter />
          </div>
        </main>
      </div>

      {/* Global Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
      </div>
      </div>
    </ReactLenis>
  );
}
