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
    const { animateCursor } = useCursorContext();

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!disableCursor) {
        switch (cursorType) {
          case "link":
            animateCursor("link");
            break;
          case "enlarge":
            animateCursor("enlarge");
            break;
          case "visitWebsite":
            animateCursor("visitWebsite");
            break;
          case "default":
            animateCursor("cursorEnter");
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
        animateCursor("cursorEnter");
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
