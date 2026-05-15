"use client";

import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import React, { useRef } from "react";
import { FileText, Briefcase, Users, MessageSquare, TrendingUp, Award, Target, Compass, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const CharacterV1 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}) => {
  const isSpace = char === " ";
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );

  return (
    <motion.span
      className={cn("inline-block text-white/90 font-heading italic leading-relaxed py-4", isSpace && "w-4 md:w-8")}
      style={{
        x,
        rotateX,
      }}
    >
      {char}
    </motion.span>
  );
};

const CharacterV2 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}) => {
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);

  const y = useTransform(
    scrollYProgress,
    [0, 0.5],
    [Math.abs(distanceFromCenter) * 50, 0],
  );

  return (
    <motion.div
      className="inline-flex items-center justify-center p-2 flex-shrink-0"
      style={{
        x,
        scale,
        y,
        transformOrigin: "center",
      }}
    >
      {char}
    </motion.div>
  );
};

const CharacterV3 = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}) => {
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 90, 0],
  );
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.5],
    [-Math.abs(distanceFromCenter) * 20, 0],
  );
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);

  return (
    <motion.div
      className="inline-flex items-center justify-center p-2 flex-shrink-0"
      style={{
        x,
        rotate,
        y,
        scale,
        transformOrigin: "center",
      }}
    >
      {char}
    </motion.div>
  );
};

export const ScrollShowcase = () => {
  const reduceMotion = useReducedMotion();
  const targetRef = useRef(null);
  const targetRef2 = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });
  const { scrollYProgress: scrollYProgress2 } = useScroll({
    target: targetRef2,
    offset: ["start end", "end start"]
  });

  const springConfig = { stiffness: 100, damping: 30, mass: 1 };
  const smoothProgress1 = useSpring(scrollYProgress, springConfig);
  const smoothProgress2 = useSpring(scrollYProgress2, springConfig);

  const text = "elevate your career";
  const characters = text.split("");
  const centerIndex = Math.floor(characters.length / 2);

  const iconClasses = "w-12 h-12 md:w-20 md:h-20 text-white/80";
  const macIcon = [
    <FileText key="1" className={iconClasses} />,
    <Briefcase key="2" className={iconClasses} />,
    <Users key="3" className={iconClasses} />,
    <MessageSquare key="4" className={iconClasses} />,
    <Sparkles key="5" className={iconClasses} />,
    <TrendingUp key="6" className={iconClasses} />,
    <Award key="7" className={iconClasses} />,
    <Target key="8" className={iconClasses} />,
    <Compass key="9" className={iconClasses} />,
  ];
  const iconCenterIndex = Math.floor(macIcon.length / 2);

  if (reduceMotion) {
    return (
      <section className="w-full bg-black relative z-10 py-24 md:py-32">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-10 text-center px-6">
          <h2 className="text-4xl md:text-6xl font-heading italic tracking-tight text-white">
            elevate your career
          </h2>
          <p className="text-xs md:text-base uppercase tracking-[0.25em] text-white/50 font-body">
            Seamless Integration
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
            {macIcon.map((icon, index) => (
              <div key={index} className="p-2">
                {icon}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-black relative z-10">
      <div
        ref={targetRef}
        className="relative box-border flex h-[210vh] items-center justify-center gap-[2vw] overflow-hidden bg-transparent p-[2vw]"
      >
        <div
          className="w-full max-w-5xl text-center text-4xl md:text-7xl lg:text-8xl tracking-tight text-white"
          style={{
            perspective: "500px",
          }}
        >
          {characters.map((char, index) => (
            <CharacterV1
              key={index}
              char={char}
              index={index}
              centerIndex={centerIndex}
              scrollYProgress={smoothProgress1}
            />
          ))}
        </div>
      </div>
      <div
        ref={targetRef2}
        className="relative -mt-[100vh] box-border flex h-[210vh] flex-col items-center justify-center gap-[2vw] overflow-hidden bg-transparent p-[2vw] pointer-events-none"
      >
        <p className="flex items-center justify-center gap-3 text-lg md:text-3xl font-body font-light tracking-widest uppercase text-white/50">
          <Bracket className="h-8 md:h-12 text-white/20" />
          <span>Seamless Integration</span>
          <Bracket className="h-8 md:h-12 scale-x-[-1] text-white/20" />
        </p>
        <div className="w-full max-w-4xl flex items-center justify-center flex-wrap md:flex-nowrap gap-2 md:gap-4 mt-8">
          {macIcon.map((char, index) => (
            <CharacterV2
              key={index}
              char={char}
              index={index}
              centerIndex={iconCenterIndex}
              scrollYProgress={smoothProgress2}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const Bracket = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 27 78"
      className={className}
    >
      <path
        fill="currentColor"
        d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"
      ></path>
    </svg>
  );
};
