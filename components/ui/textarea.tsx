import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full bg-black border-2 border-primary px-4 py-3 font-mono text-primary",
          "placeholder:text-primary/40",
          "focus:outline-none focus:border-secondary focus:shadow-[0_0_10px_rgba(0,255,65,0.3)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none",
          "transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
