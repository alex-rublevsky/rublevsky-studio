import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useCursorHoverAdvanced } from "~/components/ui/shared/custom_cursor/CustomCursorContext";
import { useIsMobile } from "~/hooks/use-mobile";

import { cn } from "~/utils/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-in-out focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-80 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-black hover:bg-transparent hover:text-black",
        inverted:
          "bg-white text-black border border-white hover:bg-transparent hover:text-white",
        destructive:
          "bg-backgorund text-destructive border border-destructive shadow-2xs hover:bg-destructive/90 hover:text-destructive-foreground",
        invertedDestructive:
          "bg-destructive text-destructive-foreground border border-destructive hover:bg-transparent",
        greenInverted:
          "bg-green-500 text-black font-medium border border-green-500 hover:bg-transparent hover:text-green-500",
        outline:
          "bg-transparent text-black border border-black hover:bg-black hover:text-white",
        accent:
          "bg-black text-black border border-black hover:bg-black hover:text-white",
        secondaryInverted:
          "bg-secondary font-medium text-secondary-foreground border border-secondary hover:bg-transparent ",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-3",
        sm: "h-9 rounded-md px-3 py-1 text-xs",
        lg: "h-12 rounded-md px-4 py-3 text-md",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  cursorType?:
    | "default"
    | "small"
    | "enlarge"
    | "link"
    | "add"
    | "block"
    | "visitWebsite"
    | "shrink"
    | "hidden";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      cursorType = "small",
      disabled = false,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    // Determine effective cursor behavior - disabled buttons use "block" cursor
    const effectiveCursorType = disabled ? "block" : cursorType;

    const { handleMouseEnter, handleMouseLeave: handleMouseLeaveHook } =
      useCursorHoverAdvanced(effectiveCursorType, disabled);

    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          // Use cursor-not-allowed for disabled buttons, cursor-default for enabled buttons
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          buttonVariants({ variant, size, className })
        )}
        ref={ref}
        disabled={disabled}
        onMouseEnter={disabled ? onMouseEnter : handleMouseEnter(onMouseEnter)}
        onMouseLeave={
          disabled ? onMouseLeave : handleMouseLeaveHook(onMouseLeave)
        }
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
