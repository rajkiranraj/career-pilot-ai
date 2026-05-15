import * as React from "react";
import { cn } from "../../lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 text-base text-white shadow-sm transition-[border-color,box-shadow,transform] duration-200 placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-body backdrop-blur-xl",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
