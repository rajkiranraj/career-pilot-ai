import { motion, useInView } from "motion/react";
import { useRef } from "react";

export const BlurText = ({
  text,
  delay = 200,
  animateBy = "words", // 'words' or 'letters'
  direction = "bottom", // 'top' or 'bottom'
  className = "",
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const elements = animateBy === "words" ? text.split(" ") : text.split("");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: delay / 1000,
      },
    },
  };

  const itemVariants = {
    hidden: {
      filter: "blur(10px)",
      opacity: 0,
      y: direction === "bottom" ? 50 : -50,
    },
    visible: {
      filter: "blur(0px)",
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`inline-flex flex-wrap ${className}`}
    >
      {elements.map((el, i) => (
        <motion.span
          key={i}
          variants={itemVariants}
          className="inline-block"
          style={{ marginRight: animateBy === "words" ? "0.3em" : "0" }}
        >
          {el === " " ? "\u00A0" : el}
        </motion.span>
      ))}
    </motion.div>
  );
};
