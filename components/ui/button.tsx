import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-terminal text-lg uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-crosshair",
  {
    variants: {
      variant: {
        default: "border-2 border-primary text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] active:animate-glitch",
        secondary: "border-2 border-secondary text-secondary hover:bg-secondary hover:text-black hover:shadow-[0_0_20px_rgba(57,255,20,0.5)]",
        destructive: "border-2 border-destructive text-destructive hover:bg-destructive hover:text-white hover:shadow-[0_0_20px_rgba(255,0,65,0.5)]",
        accent: "border-2 border-accent text-accent hover:bg-accent hover:text-white hover:shadow-[0_0_20px_rgba(176,38,255,0.5)]",
        ghost: "border-2 border-transparent text-primary hover:border-primary hover:text-secondary",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-4 py-2 text-base",
        lg: "px-8 py-4 text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        [ {children} ]
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
