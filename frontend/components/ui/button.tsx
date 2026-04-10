import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-white shadow-[var(--shadow-panel)] hover:bg-[var(--accent-strong)]",
        secondary:
          "border border-[var(--border-soft)] bg-white text-slate-700 hover:border-[var(--accent)] hover:text-[var(--accent)]",
        teal: "bg-[var(--teal)] text-white hover:bg-[#176b7b]",
        ghost: "text-slate-700 hover:bg-slate-50 hover:text-slate-950",
        destructive: "text-rose-600 hover:bg-rose-50",
      },
      size: {
        default: "h-11 px-4 py-2",
        lg: "h-12 px-5 py-3",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
