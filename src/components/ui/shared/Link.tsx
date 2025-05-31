import * as React from "react";
import { useCursorContext } from "~/components/ui/shared/custom_cursor/CustomCursorContext";
import { cn } from "~/utils/utils";

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  cursorType?: "default" | "enlarge" | "link" | "visitWebsite" | "disabled";
  disableCursor?: boolean;
  blurOnHover?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      cursorType = "link",
      disableCursor = false,
      className,
      onMouseEnter,
      onMouseLeave,
      blurOnHover = true,
      ...props
    },
    ref
  ) => {
    const { setVariant } = useCursorContext();

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!disableCursor) {
        switch (cursorType) {
          case "link":
            setVariant("link");
            break;
          case "enlarge":
            setVariant("enlarge");
            break;
          case "visitWebsite":
            setVariant("visitWebsite");
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

    const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!disableCursor && cursorType !== "disabled") {
        setVariant("default");
      }
      onMouseLeave?.(e);
    };

    return (
      <a
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "cursor-none",
          blurOnHover ? "blurLink" : undefined,
          className
        )}
        {...props}
      />
    );
  }
);
Link.displayName = "Link";

export { Link };
