import { useState } from "react";
import { LoadingBreadcrumb } from "@/components/ui/animated-loading-svg-text-shimmer";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export default function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center font-sans p-8",
        isDark && "dark",
      )}
    >
      <div className="fixed top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsDark((prev) => !prev)}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <LoadingBreadcrumb />
    </div>
  );
}
