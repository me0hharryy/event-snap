import * as React from "react"
import { cn } from "../../lib/utils"

// Add 'label' to the interface
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // <--- ADD THIS LINE
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {/* Render label if provided */}
        {label && (
           <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">
             {label}
           </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-none border-2 border-black/10 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-black disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }