import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useCursorContext } from "~/components/ui/shared/custom_cursor/CustomCursorContext";

import { cn } from "~/utils/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-in-out focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-none",
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
    | "enlarge"
    | "link"
    | "visitWebsite"
    | "add"
    | "disabled";
  disableCursor?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      cursorType = "enlarge",
      disableCursor = false,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const { setVariant } = useCursorContext();

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableCursor) {
        switch (cursorType) {
          case "enlarge":
            setVariant("enlarge");
            break;
          case "link":
            setVariant("link");
            break;
          case "visitWebsite":
            setVariant("visitWebsite");
            break;
          case "add":
            setVariant("add");
            break;
          case "default":
            setVariant("default");
            break;
          case "disabled":
            // No cursor animation
            break;
        }
      }
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableCursor && cursorType !== "disabled") {
        setVariant("default");
      }
      onMouseLeave?.(e);
    };

    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "cursor-pointer",
          buttonVariants({ variant, size, className })
        )}
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
