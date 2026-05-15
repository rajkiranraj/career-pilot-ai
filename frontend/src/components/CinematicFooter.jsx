"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Send } from "lucide-react";
import { TubesBackground } from "./ui/TubesBackground";

/* ─── inline social SVGs (lucide dropped brand icons) ─── */
const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);
const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const DiscordIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

/* ─── animation primitives ─── */
const ease = [0.16, 1, 0.3, 1];

const FadeUp = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.9, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── data ─── */
const NAV_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Resume Builder", to: "/resume" },
      { label: "Mock Interviews", to: "/interview" },
      { label: "Cover Letter AI", to: "/ai-cover-letter" },
      { label: "ATS Analyzer", to: "/ats-analyzer" },
      { label: "Career Roadmap", to: "/ai-roadmap" },
      { label: "User Dashboard", to: "/dashboard" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Pricing", to: "/#pricing" },
      { label: "Success Stories", to: "/#reviews" },
    ],
  },
];

const SOCIALS = [
  { icon: GithubIcon, label: "GitHub", href: "#" },
  { icon: LinkedinIcon, label: "LinkedIn", href: "#" },
  { icon: XIcon, label: "X / Twitter", href: "#" },
  { icon: DiscordIcon, label: "Discord", href: "#" },
];

/* ─── component ─── */
export const CinematicFooter = () => {
  return (
    <footer className="relative overflow-hidden bg-[#0a0a0a]">
      {/* ── Tubes Background (theme default) ── */}
      <div className="absolute inset-0 z-0">
        <TubesBackground
          enableClickInteraction={false}
          opacity={0.15}
        />
      </div>

      {/* Dark overlays for readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black via-transparent to-[#0a0a0a]" />
      <div className="absolute inset-0 z-[1] bg-[#0a0a0a]/70" />

      {/* ── Ambient radial glows ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.02] rounded-full blur-[160px] z-[1] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-white/[0.01] rounded-full blur-[120px] z-[1] pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10">

        {/* ━━━ SECTION 1 — Brand & Vision ━━━ */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 pt-24 md:pt-32 lg:pt-40 pb-20 md:pb-28">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <FadeUp>
              <span className="text-white/60 font-body text-[10px] md:text-xs uppercase tracking-[0.35em] font-medium mb-6 block">
                CareerPilot
              </span>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading italic text-white leading-[0.9] tracking-tight mb-6">
                The Career Your{" "}
                <span className="bg-gradient-to-r from-white/90 to-white/40 bg-clip-text text-transparent">
                  Ambition
                </span>{" "}
                Deserves
              </h2>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="text-white/50 font-body font-light text-sm md:text-base leading-relaxed max-w-xl mb-3">
                AI-powered coaching, expert-guided career tools, and precision-crafted growth
                systems built to help ambitious professionals move faster with confidence.
              </p>
            </FadeUp>

            <FadeUp delay={0.25}>
              <p className="text-white/30 font-body text-[10px] md:text-xs uppercase tracking-[0.2em] mb-10">
                Built for engineers, creators, operators, and future leaders.
              </p>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link to="/register">
                  <button className="group relative px-8 py-3.5 rounded-full bg-white text-black text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] hover:scale-105 transition-all duration-500 ease-out flex items-center gap-2.5 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                    Start Your Journey
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </button>
                </Link>
                <Link to="/resume">
                  <button className="px-8 py-3.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl text-white/70 text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] hover:text-white hover:border-white/25 hover:bg-white/[0.06] transition-all duration-500 ease-out">
                    Explore Tools
                  </button>
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>

        {/* ━━━ Divider ━━━ */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* ━━━ SECTION 2 — Big Navigation ━━━ */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12">
            {/* Nav columns */}
            {NAV_COLUMNS.map((col, colIdx) => (
              <FadeUp key={col.title} delay={0.1 * colIdx} className="flex flex-col gap-6 md:gap-8">
                <h4 className="text-xs uppercase tracking-[0.25em] font-body font-semibold text-white/40">
                  {col.title}
                </h4>
                <ul className="space-y-4 md:space-y-6">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-2xl md:text-4xl lg:text-5xl font-heading text-white/60 hover:text-white hover:pl-4 transition-all duration-500 block relative group"
                      >
                        <span className="relative z-10">{link.label}</span>
                        <span className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowUpRight className="w-4 h-4 md:w-6 md:h-6 text-white/30" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </FadeUp>
            ))}
          </div>
        </div>

        {/* ━━━ Divider ━━━ */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* ━━━ SECTION 4 — Bottom Strip ━━━ */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 py-8 md:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Copyright & microcopy */}
            <FadeUp className="flex flex-col items-center md:items-start gap-1.5">
              <span className="text-white/40 font-body text-[10px] uppercase tracking-[0.2em]">
                &copy; 2026 CareerPilot. All rights reserved.
              </span>
              <span className="text-white/20 font-body text-[9px] uppercase tracking-[0.25em]">
                Designed for professionals who refuse average.
              </span>
            </FadeUp>

            {/* Quote */}
            <FadeUp delay={0.1}>
              <span className="text-white/15 font-heading italic text-sm md:text-base tracking-wide hidden lg:block">
                Precision creates opportunity.
              </span>
            </FadeUp>

            {/* Social icons */}
            <FadeUp delay={0.2} className="flex items-center gap-4">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="group relative w-10 h-10 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm flex items-center justify-center hover:border-white/30 hover:bg-white/[0.06] transition-all duration-500 ease-out"
                >
                  <social.icon className="w-4 h-4 text-white/40 group-hover:text-white transition-colors duration-500" />
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
                </a>
              ))}
            </FadeUp>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CinematicFooter;
