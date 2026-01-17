import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: 
        "bg-orange text-white border-2 border-black shadow-[4px_4px_0px_0px_#222] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#222] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
      outline: 
        "bg-cream text-black border-2 border-black shadow-[4px_4px_0px_0px_#222] hover:bg-beige hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#222] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
      ghost: 
        "hover:bg-black/5 text-black border-2 border-transparent hover:border-black",
      danger: 
        "bg-red-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_#222] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
    };
    
    const sizes = {
      sm: "h-10 px-4 text-xs font-bold uppercase tracking-wider",
      md: "h-12 px-6 text-sm font-bold uppercase tracking-widest",
      lg: "h-14 px-8 text-lg font-bold uppercase tracking-widest",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none font-display",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export { Button };