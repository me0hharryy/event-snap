import { HTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Swiss Style: Fine 1px border, no shadow, clean white or beige bg
        "border border-black/10 bg-white p-8 hover:border-black transition-colors duration-500",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";
export { Card };