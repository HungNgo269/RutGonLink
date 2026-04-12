import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-ui-sm font-ui-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-content-inverted shadow-app-panel hover:bg-accent-strong",
        outline:
          "border border-border-soft bg-surface text-content-primary hover:border-accent hover:text-accent",
        secondary:
          "border border-border-soft bg-surface text-content-primary hover:border-accent hover:text-accent",
        teal: "bg-teal text-content-inverted hover:bg-teal-strong",
        ghost:
          "text-content-primary hover:bg-surface-hover hover:text-content-heading",
        destructive: "text-danger hover:bg-danger-soft",
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
