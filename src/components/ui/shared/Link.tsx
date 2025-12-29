import { Link as RouterLink } from "@tanstack/react-router";
import * as React from "react";
import { useCursorContext } from "~/components/ui/shared/custom_cursor/CustomCursorContext";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/utils/utils";

export interface LinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	cursorType?:
		| "default"
		| "small"
		| "enlarge"
		| "link"
		| "visitWebsite"
		| "visitPlaylist"
		| "disabled";
	disableCursor?: boolean;
	blurOnHover?: boolean;
	href: string; // Make href required to ensure proper link behavior
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
			href,
			...props
		},
		ref,
	) => {
		const { setVariant } = useCursorContext();
		const isMobile = useIsMobile();

		const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
			if (!disableCursor) {
				switch (cursorType) {
					case "link":
						setVariant("link");
						break;
					case "small":
						setVariant("small");
						break;
					case "enlarge":
						setVariant("enlarge");
						break;
					case "visitWebsite":
						setVariant("visitWebsite");
						break;
					case "visitPlaylist":
						setVariant("visitPlaylist");
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

		const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
			// Handle Enter and Space key presses for keyboard navigation
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				// Trigger click programmatically
				e.currentTarget.click();
			}
		};

		const sharedClassName = cn(
			isMobile ? "cursor-pointer" : "cursor-none",
			blurOnHover ? "blurLink" : undefined,
			className,
		);

		const sharedProps = {
			onMouseEnter: handleMouseEnter,
			onMouseLeave: handleMouseLeave,
			onKeyDown: handleKeyDown,
			className: sharedClassName,
			tabIndex: 0,
		};

		// Check if it's an internal link (starts with /)
		const isInternal = href.startsWith("/");

		if (isInternal) {
			// Use TanStack Router Link for internal navigation (enables view transitions)
			return (
				<RouterLink ref={ref} to={href} {...sharedProps} {...props}>
					{props.children}
				</RouterLink>
			);
		}

		// Use regular anchor tag for external links
		return <a ref={ref} href={href} {...sharedProps} {...props} />;
	},
);
Link.displayName = "Link";

export { Link };
