import { HTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";
export { Card };