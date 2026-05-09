import React from "react";
import { motion } from "motion/react";

export const LoaderThree = ({ className = "" }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 stroke-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] [--fill-final:rgba(255,255,255,0.95)] [--fill-initial:rgba(255,255,255,0.2)] ${className}`}
    >
      <motion.path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <motion.path
        initial={{ pathLength: 0, fill: "var(--fill-initial)" }}
        animate={{ pathLength: 1, fill: "var(--fill-final)" }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
        d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"
      />
    </motion.svg>
  );
};
