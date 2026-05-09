import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Mail, Lock, User, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// --- SUB-COMPONENTS ---

const AnimatedCheckmarkCircle = ({
  circleLength,
  strokeDuration,
  strokeDelay,
  fillDelay,
  checkmarkDelay,
}) => {
  return (
    <div className="relative">
      <svg width="20" height="20" className="-rotate-90">
        <motion.circle
          cx="10"
          cy="10"
          r="7"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          fill="transparent"
          strokeDasharray={circleLength}
          strokeDashoffset={circleLength}
          animate={{ strokeDashoffset: 0 }}
          transition={{
            duration: strokeDuration,
            ease: "easeInOut",
            delay: strokeDelay,
          }}
        />
        <motion.circle
          cx="10"
          cy="10"
          r="7"
          fill="hsl(var(--primary))"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.2,
            delay: fillDelay,
          }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-black"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.2,
          delay: checkmarkDelay,
        }}
      >
        <Check className="size-2.5" />
      </motion.div>
    </div>
  );
};

const ContainerMask = () => {
  return (
    <>
      <div className="absolute bottom-0 left-0 h-10 w-full bg-linear-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 h-24 w-3 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute right-0 bottom-0 h-24 w-3 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
    </>
  );
};

// --- MAIN COMPONENT ---

/**
 * AnimatedForm - A beautiful animated form component
 * @param {Object} props
 * @param {string} [props.title="Create Account"] - Form title
 * @param {Array} [props.fields] - Array of field objects with name and type
 * @param {number} [props.delay=7000] - Animation loop delay in ms
 * @param {Function} [props.onComplete] - Callback when animation completes
 */
export const AnimatedForm = ({
  title = "Create Account",
  fields = [
    { name: "Email Address", type: "email" },
    { name: "Password", type: "password" },
  ],
  delay = 7000,
  onComplete,
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const delayTime = Math.max(delay, 7000);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey((prev) => prev + 1);
    }, delayTime);

    return () => clearInterval(interval);
  }, [delayTime]);

  return (
    <AnimatedFormContent
      key={animationKey}
      title={title}
      fields={fields}
      onComplete={onComplete}
    />
  );
};

// --- FORM CONTENT COMPONENT ---

const AnimatedFormContent = ({ title, fields, onComplete }) => {
  const circleLength = 2 * Math.PI * 50;
  const fieldDurations = fields.map((field) => Math.ceil(field.name.length / 5));
  const totalDuration = fieldDurations.reduce((a, b) => a + b, 0);

  const getFieldIcon = (type) => {
    const iconProps = "h-4 w-4 text-white/60";
    switch (type) {
      case "email":
        return <Mail className={iconProps} />;
      case "password":
        return <Lock className={iconProps} />;
      case "name":
      case "text":
        return <User className={iconProps} />;
      case "file":
      case "url":
        return <FileText className={iconProps} />;
      default:
        return <Check className={iconProps} />;
    }
  };

  let animationDelay = 0;

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-1.5">
        <div className="relative flex flex-col gap-1 divide-y divide-white/10 rounded-lg border border-white/10 bg-black/40">
          {/* Form Title */}
          <div className="px-4 pt-4 pb-3">
            <h3 className="text-sm font-medium tracking-wide text-transparent bg-linear-to-r from-white/90 to-white/60 bg-clip-text">
              {title}
            </h3>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-3 p-3">
            {fields.map((field, fieldIndex) => {
              const currentDelay = animationDelay;
              const duration = fieldDurations[fieldIndex];
              const staggerDelay = duration / field.name.length;

              animationDelay += duration + 0.5;

              return (
                <div
                  key={`field-${fieldIndex}`}
                  className="w-full rounded-lg border border-white/10 p-3 flex items-center justify-between gap-3 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
                >
                  {/* Field Label with Animated Text */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="shrink-0">
                      {getFieldIcon(field.type)}
                    </div>
                    <div className="text-xs font-body text-white/80">
                      {field.name.split("").map((char, index) => (
                        <motion.span
                          key={`field-${fieldIndex}-char-${index}`}
                          className="inline-block"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.08,
                            delay: currentDelay + index * staggerDelay,
                            ease: "easeOut",
                          }}
                        >
                          {char === " " ? "\u00A0" : char}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Animated Checkmark */}
                  <AnimatedCheckmarkCircle
                    circleLength={circleLength}
                    strokeDuration={duration * 3 + 1}
                    strokeDelay={currentDelay}
                    fillDelay={currentDelay + duration + 0.1}
                    checkmarkDelay={currentDelay + duration + 0.2}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gradient Masks */}
      <ContainerMask />
    </div>
  );
};

export default AnimatedForm;
