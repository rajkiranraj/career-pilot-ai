"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Check, Github, Mail, Lock } from "lucide-react";
import { useEffect, useState } from "react";

type AnimatedFormProps = {
  delay?: number;
  title?: string;
  fields?: Array<{ name: string; type?: string }>;
  onSubmit?: () => void;
};

const AnimatedForm = ({
  delay = 7000,
  title = "Create Account",
  fields = [
    { name: "Email Address", type: "email" },
    { name: "Password", type: "password" },
  ],
  onSubmit,
}: AnimatedFormProps) => {
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
      onSubmit={onSubmit}
    />
  );
};

export default AnimatedForm;
const AnimatedFormContent = ({
  title,
  fields,
  onSubmit,
}: {
  title: string;
  fields: Array<{ name: string; type?: string }>;
  onSubmit?: () => void;
}) => {
  const circleLength = 2 * Math.PI * 50;
  const fieldDurations = fields.map((field) =>
    Math.ceil(field.name.length / 5)
  );
  const totalDuration = fieldDurations.reduce((a, b) => a + b, 0);

  const getFieldIcon = (type?: string) => {
    switch (type) {
      case "email":
        return <Mail className="text-primary size-4" />;
      case "password":
        return <Lock className="text-primary size-4" />;
      default:
        return <Check className="text-primary size-4" />;
    }
  };

  let animationDelay = 0;

  return (
    <div className={cn("relative", "w-full max-w-85")}>
      <div className="w-full rounded-xl border border-neutral-200/60 p-1.5 dark:border-neutral-900/60">
        <div
          className={cn(
            "relative",
            "flex flex-col gap-1 divide-y divide-neutral-200 rounded-lg",
            "border border-neutral-200 dark:divide-neutral-900 dark:border-neutral-900",
          )}
        >
          <div
            className={cn(
              "px-3 pt-3 pb-2 text-[14px] leading-4 tracking-wide text-transparent",
              "bg-linear-to-r from-neutral-700 to-neutral-300 bg-clip-text dark:from-neutral-400 dark:to-neutral-700",
            )}
          >
            {title}
          </div>
          <div className="flex flex-col gap-2 p-2">
            {fields.map((field, fieldIndex) => {
              const currentDelay = animationDelay;
              const duration = fieldDurations[fieldIndex];
              const staggerDelay = duration / field.name.length;

              animationDelay += duration + 0.5;

              return (
                <div
                  key={`field-${fieldIndex}`}
                  className={cn(
                    "w-full rounded-md border p-2",
                    "flex items-center justify-between gap-4",
                    "bg-linear-to-r from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950",
                  )}
                >
                  <div className="text-xs flex items-center gap-2">
                    <span className="opacity-60">
                      {getFieldIcon(field.type)}
                    </span>
                    {field.name.split("").map((char, index) => (
                      <motion.span
                        key={`field-${fieldIndex}-char-${index}`}
                        className="inline-block font-[350]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.1,
                          delay: currentDelay + index * staggerDelay,
                          ease: "easeOut",
                        }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                  </div>

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
      <ContainerMask />
    </div>
  );

type AnimatedCheckmarkCircleProps = {
  circleLength: number;
  strokeDuration: number;
  strokeDelay: number;
  fillDelay: number;
  checkmarkDelay: number;
};

export const AnimatedCheckmarkCircle = ({
  circleLength,
  strokeDuration,
  strokeDelay,
  fillDelay,
  checkmarkDelay,
}: AnimatedCheckmarkCircleProps) => {
  return (
    <div className="relative">
      <svg width="20" height="20" className="-rotate-90">
        <motion.circle
          cx="10"
          cy="10"
          r="7"
          stroke="#22c55e"
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
          fill="#22c55e"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.2,
            delay: fillDelay,
          }}
        />
      </svg>
      <motion.div
        className="text-background absolute inset-0 flex items-center justify-center"
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
      <div className="absolute bottom-0 left-0 h-10 w-full bg-[linear-gradient(to_top,var(--color-background)_60%,transparent_100%)]" />
      <div className="absolute bottom-0 left-0 h-25 w-3 bg-[linear-gradient(to_top,var(--color-background)_60%,transparent_100%)]" />
      <div className="absolute right-0 bottom-0 h-25 w-3 bg-[linear-gradient(to_top,var(--color-background)_60%,transparent_100%)]" />
    </>
  );
};
