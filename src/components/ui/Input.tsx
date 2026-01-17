import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full border-2 border-black bg-white px-4 py-2 text-lg ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-black/40 focus:visible:outline-none focus:shadow-[4px_4px_0px_0px_#FA8112] transition-all disabled:cursor-not-allowed disabled:opacity-50 font-sans",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
export { Input };