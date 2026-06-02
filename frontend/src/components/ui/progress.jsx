import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(({ className, value = 0, max = 100, ...props }, ref) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div ref={ref} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)} {...props}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          percentage >= 90 ? "bg-destructive" : percentage >= 70 ? "bg-yellow-500" : "bg-primary",
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
