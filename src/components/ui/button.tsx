import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        // Primary Button - Barpel Teal - Highest emphasis
        default: "bg-barpel-teal text-white shadow-lg shadow-barpel-teal/20 hover:shadow-xl hover:shadow-barpel-teal/30 hover:scale-105 active:scale-100 focus-visible:ring-barpel-teal/50",

        // Secondary Button - Medium emphasis
        secondary: "bg-barpel-teal-dark text-white shadow-md shadow-barpel-teal-dark/15 hover:shadow-lg hover:shadow-barpel-teal-dark/25 hover:scale-105 active:scale-100 focus-visible:ring-barpel-teal-dark/50",

        // Outline Button - Low emphasis
        outline: "bg-white text-barpel-teal border-2 border-barpel-teal/20 shadow-sm hover:shadow-md hover:bg-barpel-teal/5 hover:border-barpel-teal/30 active:bg-barpel-teal/10 focus-visible:ring-barpel-teal/50",

        // Ghost Button - Minimal style
        ghost: "text-barpel-teal hover:bg-barpel-teal/10 active:bg-barpel-teal/15 focus-visible:ring-barpel-teal/30",

        // Destructive Button - Deep Slate - For delete/danger actions
        destructive: "bg-barpel-slate text-white shadow-md shadow-barpel-slate/20 hover:shadow-lg hover:shadow-barpel-slate/30 hover:scale-105 active:scale-100 focus-visible:ring-barpel-slate/50",

        // Link Button - Text only with underline
        link: "text-barpel-teal font-medium underline-offset-4 hover:text-barpel-teal-dark hover:underline focus-visible:ring-barpel-teal/30",
      },
      size: {
        default: "h-10 px-4 py-2.5",
        sm: "h-9 px-3 py-2 text-xs",
        lg: "h-11 px-6 py-3 text-base",
        icon: "h-10 w-10",
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
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
